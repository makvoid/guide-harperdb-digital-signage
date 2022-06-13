export interface HarperDBRecord {
  message?: string
  __createdtime__?: number
  __updatedtime__?: number
}

export interface HarperDBRequest {
  operation: string
  schema?: string
  table?: string
  sql?: string
  hash_attribute?: string
  attribute?: string
  records?: any[]
  hash_values?: any[]
  get_attributes?: string[]
  search_value?: string
  search_attribute?: string
}

export interface HarperDBUser extends HarperDBRecord {
  username?: string
  active?: string
}

export interface HarperDBOperationResult {
  message: string
  skipped_hashes: string[]
}

export interface HarperDBUpdateRequest extends HarperDBOperationResult {
  update_hashes: string[]
}

export interface HarperDBDeletionRequest extends HarperDBOperationResult {
  deleted_hashes: string[]
}

export interface HarperDBInsertRequest extends HarperDBOperationResult {
  inserted_hashes: string[]
}
