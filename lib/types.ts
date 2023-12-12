import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>


export interface DocumentInfo extends Record<string, any> {
    pdf_key: string
    vdb_key: string
    kg_key: string
    index_name: string
    pages_key: string
    doc_title: string
    file_name: string
}
