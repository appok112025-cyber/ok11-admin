export interface Faq {
  id: number
  documentId: string
  order: number
  question: string
  answer: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface FaqForm {
  order: number
  question: string
  answer: string
}

export interface TempFaq {
  id: string
  order: number
  question: string
  answer: string
}
