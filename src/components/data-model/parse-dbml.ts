export type DbmlSchema = {
  tables: DbmlTable[]
  enums: DbmlEnum[]
  relationships: DbmlRelationship[]
}

export type DbmlTable = {
  name: string
  fields: DbmlField[]
  indexes: DbmlIndex[]
  note?: string
}

export type DbmlField = {
  name: string
  type: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  foreignKeyRef?: { table: string; field: string }
  isNullable: boolean
  isUnique: boolean
  hasDefault: boolean
  defaultValue?: string
  note?: string
}

export type DbmlIndex = {
  fields: string[]
  isUnique: boolean
  isPrimaryKey: boolean
}

export type DbmlEnum = {
  name: string
  values: string[]
}

export type DbmlRelationship = {
  fromTable: string
  fromField: string
  toTable: string
  toField: string
  cardinality: '1:1' | '1:*' | '*:1' | '*:*'
}
