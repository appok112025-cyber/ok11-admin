import type { ApiResponse } from '@/types/api'
import type { Match } from '@/types/match'
import { requireAuth, requireParam, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Match>> => {
    try {
      requireAuth(event)
      const id = requireParam(event, 'id')
      const body = await readBody(event)
      const matchData = body.data || body

      const payload: any = {}

      if (matchData.matchNumber !== undefined) {
        payload.matchNumber = matchData.matchNumber
      }
      if (matchData.matchName !== undefined) {
        payload.matchName = matchData.matchName
      }
      if (matchData.teamA !== undefined) {
        payload.teamA = matchData.teamA
      }
      if (matchData.teamB !== undefined) {
        payload.teamB = matchData.teamB
      }
      if (matchData.matchTime !== undefined) {
        payload.matchTime = matchData.matchTime
      }
      if (matchData.status !== undefined) {
        payload.status = matchData.status
      }
      if (matchData.score !== undefined) {
        payload.score = matchData.score
      }

      if (matchData.players !== undefined) {
        const teamAPlayers = Array.isArray(matchData.players.teamA)
          ? matchData.players.teamA.filter(
              (id: any) =>
                id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
            )
          : []
        const teamBPlayers = Array.isArray(matchData.players.teamB)
          ? matchData.players.teamB.filter(
              (id: any) =>
                id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
            )
          : []

        if (
          teamAPlayers.length === 0 &&
          matchData.players.teamA !== undefined
        ) {
          throw createError({
            statusCode: 422,
            statusMessage: 'At least one valid player is required for Team A',
          })
        }

        if (
          teamBPlayers.length === 0 &&
          matchData.players.teamB !== undefined
        ) {
          throw createError({
            statusCode: 422,
            statusMessage: 'At least one valid player is required for Team B',
          })
        }

        payload.players = {
          teamA: teamAPlayers,
          teamB: teamBPlayers,
        }
      }

      if (matchData.quizzes !== undefined) {
        payload.quizzes = Array.isArray(matchData.quizzes)
          ? matchData.quizzes.map((quiz: any) => ({
              questionId: quiz.questionId || undefined,
              question: quiz.question || '',
              options: Array.isArray(quiz.options)
                ? quiz.options.map((opt: any) => ({
                    text: typeof opt === 'string' ? opt : opt?.text || '',
                  }))
                : [],
              correctAnswer:
                quiz.correctAnswer !== undefined ? quiz.correctAnswer : null,
              points: quiz.points || 10,
            }))
          : []
      }

      const response = await backendApiRequest<any>(
        event,
        `/api/matches/${id}`,
        {
          method: 'PUT',
          body: payload,
        }
      )

      return {
        data: response.data || response,
        meta: response.meta || {},
      }
    } catch (error: any) {
      if (error.statusCode) {
        throw error
      }
      return handleApiError(error, 'update match')
    }
  }
)
