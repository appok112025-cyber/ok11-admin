import type { Team } from './team'

export interface Participant {
  id: string
  name: string
  email: string
  status: 'Opted In' | 'Attended'
}

export interface QuizOption {
  text: string
}

export interface MatchQuiz {
  questionId?: string
  question: string
  options: QuizOption[]
  correctAnswer: number | null
  points: number
  saved?: boolean
}

export interface Match {
  id: string
  matchNumber: number
  matchName?: string
  teamA: Team
  teamB: Team
  matchTime: string
  status: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled'
  score?: string
  participantsCount: number
  participants?: Participant[]
  players?: {
    teamA: Array<string | { id: string; name: string; _id?: string }>
    teamB: Array<string | { id: string; name: string; _id?: string }>
  }
  quizzes?: MatchQuiz[]
}
