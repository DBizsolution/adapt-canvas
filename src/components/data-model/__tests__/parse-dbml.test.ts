import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { parseDbml } from '../parse-dbml'

test('parseDbml - parses simple table definition', () => {
  const dbml = `
Table users {
  id int [pk, increment]
  email varchar(255) [unique, not null]
  created_at timestamp
}
`
  const result = parseDbml(dbml)

  assert.strictEqual(result.tables.length, 1)
  assert.strictEqual(result.tables[0].name, 'users')
  assert.strictEqual(result.tables[0].fields.length, 3)
  assert.strictEqual(result.tables[0].fields[0].isPrimaryKey, true)
  assert.strictEqual(result.tables[0].fields[1].isUnique, true)
  assert.strictEqual(result.tables[0].fields[1].isNullable, false)
})

test('parseDbml - parses enum definitions', () => {
  const dbml = `
Enum user_role {
  admin
  user
  guest
}
`
  const result = parseDbml(dbml)

  assert.strictEqual(result.enums.length, 1)
  assert.strictEqual(result.enums[0].name, 'user_role')
  assert.deepEqual(result.enums[0].values, ['admin', 'user', 'guest'])
})

test('parseDbml - parses foreign key references', () => {
  const dbml = `
Table posts {
  id int [pk]
  user_id int [ref: > users.id]
}
`
  const result = parseDbml(dbml)

  assert.strictEqual(result.tables[0].fields[1].isForeignKey, true)
  assert.deepEqual(result.tables[0].fields[1].foreignKeyRef, {
    table: 'users',
    field: 'id'
  })
  assert.strictEqual(result.relationships.length, 1)
  assert.strictEqual(result.relationships[0].fromTable, 'posts')
  assert.strictEqual(result.relationships[0].toTable, 'users')
})

test('parseDbml - parses field notes', () => {
  const dbml = `
Table users {
  email varchar(255) [note: 'User email address']
}
`
  const result = parseDbml(dbml)

  assert.strictEqual(result.tables[0].fields[0].note, 'User email address')
})

test('parseDbml - handles empty input', () => {
  const result = parseDbml('')

  assert.deepEqual(result.tables, [])
  assert.deepEqual(result.enums, [])
  assert.deepEqual(result.relationships, [])
})
