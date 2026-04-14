export interface SiteContent {
  about: string
  points: string
  terms: string
}

export interface SiteContentResponse {
  data: {
    id: number
    documentId: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    about: string
    points: string
    terms: string
  }
  meta: {}
}

export interface SocialLink {
  title: string
  url: string
}

export interface AboutData {
  content: string
  links: SocialLink[]
}

export interface PointItem {
  title: string
  description: string
}

export interface PointsData {
  content: string
  items: PointItem[]
}

export interface TermItem {
  title: string
  description: string
}

export interface TermsData {
  content: string
  items: TermItem[]
}
