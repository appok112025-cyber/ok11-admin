import type { ApiResponse } from '@/types/api'
import type { Match } from '@/types/match'
import { requireAuth, handleApiError } from '../../utils/api'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Match>> => {
    try {
      requireAuth(event)
      const body = await readBody(event)
      const matchData = body.data || body

      // Ensure matchNumber is a number
      const matchNumber =
        typeof matchData.matchNumber === 'string'
          ? parseInt(matchData.matchNumber, 10)
          : matchData.matchNumber

      if (!Number.isInteger(matchNumber) || matchNumber <= 0) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Match number must be a positive integer',
        })
      }

      // Ensure matchTime is a valid ISO datetime string
      let matchTime = matchData.matchTime
      if (matchTime) {
        if (matchTime instanceof Date) {
          matchTime = matchTime.toISOString()
        } else if (typeof matchTime === 'string') {
          // Validate it's a valid ISO string
          const date = new Date(matchTime)
          if (isNaN(date.getTime())) {
            throw createError({
              statusCode: 422,
              statusMessage: 'Invalid match time format',
            })
          }
          matchTime = date.toISOString()
        }
      } else {
        throw createError({
          statusCode: 422,
          statusMessage: 'Match time is required',
        })
      }

      // Validate team IDs are valid ObjectIds
      if (
        !matchData.teamA ||
        typeof matchData.teamA !== 'string' ||
        !/^[0-9a-fA-F]{24}$/.test(matchData.teamA)
      ) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Invalid Team A ID format',
        })
      }

      if (
        !matchData.teamB ||
        typeof matchData.teamB !== 'string' ||
        !/^[0-9a-fA-F]{24}$/.test(matchData.teamB)
      ) {
        throw createError({
          statusCode: 422,
          statusMessage: 'Invalid Team B ID format',
        })
      }

      const payload: any = {
        matchNumber,
        teamA: matchData.teamA,
        teamB: matchData.teamB,
        matchTime,
        status: matchData.status || 'Upcoming',
        players: {
          teamA: Array.isArray(matchData.players?.teamA)
            ? matchData.players.teamA.filter(
                (id: any) =>
                  id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
              )
            : [],
          teamB: Array.isArray(matchData.players?.teamB)
            ? matchData.players.teamB.filter(
                (id: any) =>
                  id && typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)
              )
            : [],
        },
      }

      if (
        matchData.score !== undefined &&
        matchData.score !== null &&
        matchData.score !== ''
      ) {
        payload.score = matchData.score
      }

      // Validate and filter quizzes
      if (matchData.quizzes !== undefined && Array.isArray(matchData.quizzes)) {
        payload.quizzes = matchData.quizzes
          .filter((quiz: any) => {
            // Only include quizzes with valid structure
            return (
              quiz &&
              typeof quiz === 'object' &&
              quiz.question &&
              typeof quiz.question === 'string' &&
              quiz.question.trim().length > 0 &&
              Array.isArray(quiz.options) &&
              quiz.options.length >= 2 &&
              quiz.options.length <= 4 &&
              quiz.options.every(
                (opt: any) =>
                  opt &&
                  typeof opt === 'object' &&
                  opt.text &&
                  typeof opt.text === 'string' &&
                  opt.text.trim().length > 0
              )
            )
          })
          .map((quiz: any) => ({
            questionId: quiz.questionId || undefined,
            question: quiz.question.trim(),
            options: quiz.options.map((opt: any) => ({
              text: opt.text.trim(),
            })),
            correctAnswer:
              quiz.correctAnswer !== null && quiz.correctAnswer !== undefined
                ? Number.isInteger(quiz.correctAnswer) &&
                  quiz.correctAnswer >= 0 &&
                  quiz.correctAnswer < quiz.options.length
                  ? quiz.correctAnswer
                  : null
                : null,
            points:
              quiz.points && Number.isInteger(quiz.points) && quiz.points > 0
                ? quiz.points
                : 10,
          }))
      } else {
        payload.quizzes = []
      }

      if (payload.players.teamA.length === 0) {
        throw createError({
          statusCode: 422,
          statusMessage: 'At least one valid player is required for Team A',
        })
      }

      if (payload.players.teamB.length === 0) {
        throw createError({
          statusCode: 422,
          statusMessage: 'At least one valid player is required for Team B',
        })
      }

      console.log(
        'Sending payload to backend:',
        JSON.stringify(payload, null, 2)
      )

      const response = await backendApiRequest<any>(event, '/api/matches', {
        method: 'POST',
        body: payload,
      })

      return {
        data: response.data || response,
        meta: response.meta || {},
      }
    } catch (error: any) {
      console.error('Error creating match:', {
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        data: error.data,
        details: error.data?.details,
      })

      if (error.statusCode) {
        // If it's a validation error from backend, include details
        if (error.statusCode === 400 && error.data?.details) {
          const validationErrors = error.data.details
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(', ')
          throw createError({
            statusCode: 400,
            statusMessage: `Validation failed: ${validationErrors}`,
            data: error.data,
          })
        }
        throw error
      }
      return handleApiError(error, 'create match')
    }
  }
)
