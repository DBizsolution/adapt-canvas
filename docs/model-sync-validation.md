# Model Sync Validation

Automated validation system that ensures schema consistency across the intent model codebase.

## Overview

The model sync validator catches mismatches between:
- TypeScript type definitions (`types.ts`)
- Zod schemas (`model-schemas.ts`)
- AI prompt type definitions (`ai-prompt.ts`)
- Entity references in the model
- Duplicate IDs

## Usage

### CLI Validation

Run manual validation anytime:

```bash
pnpm validate:model
```

This will:
- Validate the current model against all schemas
- Check for constraint type mismatches
- Verify entity references are valid
- Check for orphaned references
- Report errors and warnings with actionable fixes

### Automatic Validation

Validation runs automatically when:

1. **Applying AI-generated changes** (`/api/model/edit/apply`)
   - Blocks save if validation fails with errors
   - Logs warnings but allows save
   - Returns validation issues to the client

2. **Adding versions** (`model-store.addVersion()`)
   - Runs quick validation (Zod schema only)
   - Throws error if validation fails
   - Prevents invalid models from being persisted

## Validation Checks

### 1. Schema Validation
Validates model against Zod schemas to ensure structure is correct.

**Severity:** Error
**Fix:** Ensure model structure matches Zod schema in `model-schemas.ts`

### 2. Constraint Type Sync
Checks that constraint types match between `types.ts` and `model-schemas.ts`.

**Severity:** Error
**Fix:** Run `pnpm generate:schemas` to regenerate Zod schemas

### 3. AI Prompt Sync
Verifies AI prompt type definitions match `types.ts`.

**Severity:** Warning
**Fix:** Manually update `TYPE_DEFINITIONS` in `ai-prompt.ts`

### 4. Entity References
Validates that:
- Journey `primary_actor` references exist
- Business rule `applies_to` references exist
- All referenced IDs are valid

**Severity:** Error
**Fix:** Update references or add missing entities

### 5. Orphaned References
Checks for duplicate IDs across the model.

**Severity:** Error
**Fix:** Ensure all IDs are unique

## API

### `validateModelSync(model: IntentModel): Promise<SyncValidationResult>`

Comprehensive validation that runs all checks.

```typescript
const result = await validateModelSync(intentModel)

if (!result.valid) {
  console.error('Validation failed:', result.issues)
  console.log('Suggestions:', result.suggestions)
}
```

### `quickValidate(model: IntentModel): Promise<{ valid: boolean; error?: string }>`

Fast validation for hot paths - only checks Zod schema.

```typescript
const { valid, error } = await quickValidate(model)
if (!valid) {
  throw new Error(`Model validation failed: ${error}`)
}
```

## Issue Types

- `schema-mismatch` - Model doesn't match Zod schema
- `constraint-type-mismatch` - Constraint types out of sync
- `ai-prompt-mismatch` - AI prompt types out of sync
- `orphaned-reference` - Invalid entity references
- `missing-type` - Missing type definitions

## Output Format

```typescript
interface SyncValidationResult {
  valid: boolean              // True if no errors (warnings OK)
  issues: SyncIssue[]        // All validation issues
  suggestions: string[]       // Actionable fix suggestions
}

interface SyncIssue {
  severity: 'error' | 'warning'
  type: string
  message: string
  fix?: string               // Optional fix suggestion
}
```

## Example Output

```
🔍 Validating intent model sync...

⚠️  Found 2 warning(s):

   [ai-prompt-mismatch] Constraint types in types.ts but not in ai-prompt.ts: platform, notification
   → Fix: Update TYPE_DEFINITIONS in ai-prompt.ts

   [ai-prompt-mismatch] Optional field 'deferred' in Actor exists in types.ts but not in ai-prompt.ts
   → Fix: Update TYPE_DEFINITIONS in ai-prompt.ts

💡 Suggestions:

   • Update TYPE_DEFINITIONS in src/lib/ai-prompt.ts to match src/domain/intent-model/types.ts
```

## Integration Points

### Model Store
`addVersion()` runs quick validation before persisting any model version.

### API Routes
`/api/model/edit/apply` runs full validation before applying AI-generated changes.

### Pre-commit Hook (Future)
Could be added to `package.json` to run validation before commits:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm validate:model"
    }
  }
}
```

## Performance

- **Quick validation:** ~10-20ms (schema check only)
- **Full validation:** ~50-100ms (all checks including file I/O)

Quick validation is suitable for hot paths (API routes, saves).
Full validation is better for CLI/manual checks.

## Future Enhancements

1. **Generate fixes automatically**
   - Auto-sync `ai-prompt.ts` from `types.ts`
   - Auto-update references when entities are renamed

2. **Version history validation**
   - Validate all stored versions, not just current
   - Detect when schemas become out of sync

3. **CI/CD integration**
   - Block deploys if validation fails
   - Report validation status in PR checks

4. **Visual diff**
   - Show side-by-side comparison of mismatched types
   - Highlight exactly what needs to change
