import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DiffItem } from '@/lib/review-utils'

const changeConfig = {
  added: { label: 'Added', className: 'bg-green-100 text-green-800 border-green-300' },
  removed: { label: 'Removed', className: 'bg-red-100 text-red-800 border-red-300' },
  modified: { label: 'Modified', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  unchanged: { label: 'Unchanged', className: 'bg-gray-100 text-gray-600 border-gray-300' },
}

export function DiffViewer({ diffs }: { diffs: DiffItem[] }) {
  const changes = diffs.filter(d => d.change !== 'unchanged')
  const unchanged = diffs.filter(d => d.change === 'unchanged')

  if (changes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No changes between versions.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {changes.length} changed, {unchanged.length} unchanged
      </p>
      {changes.map(diff => {
        const config = changeConfig[diff.change]
        const displayName = diff.current
          ? ('name' in diff.current ? diff.current.name : diff.current.id)
          : diff.previous
            ? ('name' in diff.previous ? diff.previous.name : diff.previous.id)
            : diff.targetId

        return (
          <Card key={diff.targetId} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium">{displayName as string}</h3>
                <code className="text-xs text-muted-foreground">{diff.targetId}</code>
              </div>
              <Badge variant="default" className={config.className}>
                {config.label}
              </Badge>
            </div>
            {diff.change === 'modified' && diff.current && diff.previous && (
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto mt-2 max-h-60">
                {JSON.stringify(diff.current, null, 2)}
              </pre>
            )}
          </Card>
        )
      })}
    </div>
  )
}
