export interface UserResponse {
  id: number
  email: string
  username: string
  role?: {
    id: number
    name: string
    description: string
    type: string
  }
}

export interface UserMatch {
  submissionId: string
  matchId: string
  date: string
  team: string
  score: string
  points: number
  status: 'Won' | 'Lost' | 'Pending'
}

export interface UserWithMatches {
  id: string
  name: string | null
  email: string
  phone: string | null
  photoURL?: string | null
  lastLoggedIn: string | null
  createdAt: string
  appVersion: string | null
  matches: UserMatch[]
  blocked?: boolean
}
