export interface QuizAnswer {
  question?: string
  selectedOption: number
  isCorrect: boolean
  points: number
  pointsEarned: number
  options?: Array<{ text: string } | string>
  correctAnswer?: number | null
  userSelectedOption?: number
}

export interface Player {
  id: string
  name: string
}

export interface Team {
  id: string
  name: string
  imageUrl?: string
}

export interface MatchData {
  id: string
  matchNumber?: number
  teamA?: Team
  teamB?: Team
  status?: string
}

export interface Submission {
  id: string
  userId: string
  userName: string
  userEmail: string
  matchId: string
  match?: MatchData
  selectedPlayer: string
  teamASelectedPlayers?: Player[]
  teamBSelectedPlayers?: Player[]
  quizAnswers: QuizAnswer[]
  totalPoints: number
  totalPointsEarned: number
  status: 'pending' | 'evaluated' | 'completed'
  submittedAt: string
  evaluatedAt?: string
}

export interface SubmissionFilters {
  userId?: string
  matchId?: string
  status?: string
}
