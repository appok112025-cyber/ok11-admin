import type { Match } from '~/types/match'
import { retry } from '~/utils/common/retry'
import { validateRequired } from '~/utils/validation/validation'
import { getApiErrorMessage, useApi } from '~/utils/api/api'
import { useRequestCancellation } from '../common/useRequestCancellation'
import { useToast } from '../common/useToast'

export const useMatches = () => {
  const route = useRoute()
  const router = useRouter()
  const { getMatches, createMatch, updateMatch, deleteMatch } = useApi()
  const { createAbortController } = useRequestCancellation()
  const { success, error: showError } = useToast()

  const matches = ref<Match[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedMatch = ref<Match | null>(null)
  const showModal = ref(false)
  const submitting = ref(false)

  const form = ref<{
    matchNumber: string
    matchName: string
    teamA: string
    teamB: string
    matchTime: string
    status: Match['status']
    score: string
    players?: {
      teamA: string[]
      teamB: string[]
    }
    // quizzes?: Array<{
    //   questionId?: string
    //   question: string
    //   options: Array<{ text: string }>
    //   correctAnswer: number | null
    //   points: number
    //   saved?: boolean
    // }>
  }>({
    matchNumber: '',
    matchName: '',
    teamA: '',
    teamB: '',
    matchTime: '',
    status: 'Upcoming',
    score: '',
    players: { teamA: [], teamB: [] },
    // quizzes: [],
  })

  const navigateToMatch = (matchId: string) => {
    router.push(`/matches/${matchId}`)
  }

  const closeMatchDetail = () => {
    router.push('/matches')
  }

  const openMatchDetail = (matchId: string) => {
    const match = matches.value.find(m => m.id === matchId)
    if (match) {
      selectedMatch.value = { ...match }
    }
  }

  const loadMatches = async () => {
    loading.value = true
    error.value = null
    const abortController = createAbortController()

    try {
      const response = await retry(() => getMatches(), {
        maxRetries: 2,
        retryCondition: (err: any) => {
          if (abortController.signal.aborted) return false
          return !err.status || (err.status >= 500 && err.status < 600)
        },
      })

      if (abortController.signal.aborted) return

      // Handle edge cases: null, undefined, or empty data
      // The API might return paginated response: { data: [...], pagination: {...} }
      // Or direct array: [...]
      let matchesData: any[] = []

      if (response?.data) {
        const responseData = response.data as any
        // Check if response.data is paginated (has data and pagination properties)
        if (responseData.data && Array.isArray(responseData.data)) {
          matchesData = responseData.data
        } else if (Array.isArray(responseData)) {
          matchesData = responseData
        } else {
          console.warn('API returned non-array data for matches:', responseData)
        }
      }

      if (matchesData.length > 0) {
        matches.value = matchesData
          .filter(match => match != null)
          .map((match: any) => {
            // Normalize team objects to ensure they have id, name, and imageUrl
            const normalizeTeam = (
              team: any
            ): { id: string; name: string; imageUrl: string } => {
              if (!team) return { id: '', name: '', imageUrl: '' }
              if (typeof team === 'string') {
                return { id: team, name: '', imageUrl: '' }
              }
              return {
                id: team._id?.toString() || team.id?.toString() || '',
                name: team.name || '',
                imageUrl: team.imageUrl || team.image || '',
              }
            }

            const normalizedMatch: any = {
              ...match,
              id: match._id || match.id,
              teamA: normalizeTeam(match.teamA),
              teamB: normalizeTeam(match.teamB),
            }

            if (match.players) {
              const normalizePlayers = (
                players: any[]
              ): Array<string | { id: string; name: string }> => {
                if (!Array.isArray(players)) return []
                return players
                  .map((p: any) => {
                    if (typeof p === 'string') return p
                    if (p && typeof p === 'object') {
                      // If the player object has a name, preserve it
                      if (p.name) {
                        return {
                          id: p._id?.toString() || p.id?.toString() || '',
                          name: p.name,
                        }
                      }
                      // Fallback to just ID
                      return (
                        p._id?.toString() || p.id?.toString() || p.toString()
                      )
                    }
                    return p?.toString() || ''
                  })
                  .filter(
                    (item: string | { id: string; name: string }) =>
                      item &&
                      (typeof item === 'string' ||
                        (typeof item === 'object' && item.id))
                  )
              }

              normalizedMatch.players = {
                teamA: normalizePlayers(match.players.teamA || []),
                teamB: normalizePlayers(match.players.teamB || []),
              }
            }

            // if (match.quizzes && Array.isArray(match.quizzes)) {
            //   normalizedMatch.quizzes = match.quizzes.map((quiz: any) => ({
            //     questionId:
            //       quiz.questionId ||
            //       quiz._id?.toString() ||
            //       quiz.id?.toString(),
            //     question: quiz.question || '',
            //     options: Array.isArray(quiz.options)
            //       ? quiz.options.map((opt: any) => ({
            //           text: typeof opt === 'string' ? opt : opt?.text || '',
            //         }))
            //       : [],
            //     correctAnswer: quiz.correctAnswer ?? null,
            //     points: quiz.points || 10,
            //     saved: true,
            //   }))
            // }

            return normalizedMatch
          }) as Match[]
        console.log(`Loaded ${matches.value.length} matches`)
      } else {
        matches.value = []
        if (response?.data) {
          console.warn('No matches found in API response:', response.data)
        } else {
          console.warn('No data in API response:', response)
        }
      }
    } catch (err: any) {
      if (abortController.signal.aborted) return

      const errorMessage = getApiErrorMessage(err)
      error.value = errorMessage
      showError(errorMessage)
    } finally {
      if (!abortController.signal.aborted) {
        loading.value = false
      }
    }
  }

  const openAddModal = () => {
    const nextMatchNumber =
      matches.value.length > 0
        ? Math.max(...matches.value.map(m => m.matchNumber || 0)) + 1
        : 1
    form.value = {
      matchNumber: nextMatchNumber.toString(),
      matchName: '',
      teamA: '',
      teamB: '',
      matchTime: '',
      status: 'Upcoming',
      score: '',
      players: { teamA: [], teamB: [] },
      // quizzes: [],
    }
    showModal.value = true
  }

  const closeModal = () => {
    if (!submitting.value) {
      showModal.value = false
      form.value = {
        matchNumber: '',
        matchName: '',
        teamA: '',
        teamB: '',
        matchTime: '',
        status: 'Upcoming',
        score: '',
        players: { teamA: [], teamB: [] },
        // quizzes: [],
      }
    }
  }

  const editingMatchId = ref<string | null>(null)

  const handleSubmit = async (): Promise<boolean> => {
    const teamAValidation = validateRequired(form.value.teamA, 'Team A')
    if (!teamAValidation.valid) {
      showError(teamAValidation.error!)
      return false
    }

    const teamBValidation = validateRequired(form.value.teamB, 'Team B')
    if (!teamBValidation.valid) {
      showError(teamBValidation.error!)
      return false
    }

    const matchNumberValidation = validateRequired(
      form.value.matchNumber,
      'Match Number'
    )
    if (!matchNumberValidation.valid) {
      showError(matchNumberValidation.error!)
      return false
    }

    const matchTimeValidation = validateRequired(
      form.value.matchTime,
      'Match Time'
    )
    if (!matchTimeValidation.valid) {
      showError(matchTimeValidation.error!)
      return false
    }

    submitting.value = true

    try {
      if (editingMatchId.value) {
        const matchToUpdate = matches.value.find(
          m => m.id === editingMatchId.value
        )
        if (!matchToUpdate) {
          showError('Match not found')
          submitting.value = false
          return false
        }

        const previousData = { ...matchToUpdate }

        matchToUpdate.matchNumber = parseInt(form.value.matchNumber, 10)
        matchToUpdate.matchName = form.value.matchName?.trim() || ''
        // teamA and teamB are Team objects, keep them as is
        matchToUpdate.matchTime = new Date(form.value.matchTime).toISOString()
        matchToUpdate.status = form.value.status
        matchToUpdate.score = form.value.score?.trim() || undefined
        matchToUpdate.players = form.value.players
        // matchToUpdate.quizzes = form.value.quizzes

        try {
          const playersResponse = await $fetch<{ data: any[] }>('/api/players')
          const allPlayers = (playersResponse.data || []).map(
            (player: any) => ({
              id: player._id || player.id,
              name: player.name,
            })
          )

          const playerNameToIdMap = new Map<string, string>()
          allPlayers.forEach(player => {
            playerNameToIdMap.set(player.name, player.id)
          })

          const convertPlayerNamesToIds = (playerNames: string[]): string[] => {
            return playerNames
              .map(name => playerNameToIdMap.get(name))
              .filter((id): id is string => id !== undefined)
          }

          const playersForApi = {
            teamA: convertPlayerNamesToIds(form.value.players?.teamA || []),
            teamB: convertPlayerNamesToIds(form.value.players?.teamB || []),
          }

          // console.log('matchToUpdate.quizzes before filtering:', {
          //   quizzes: matchToUpdate.quizzes,
          //   count: matchToUpdate.quizzes?.length,
          // })

          const quizzesForApi: any[] = []
          // const quizzesForApi = (matchToUpdate.quizzes || [])
          //   .filter((quiz: any) => {
          //     // Include quiz if it has a question or questionId AND has at least 2 options with text
          //     const hasQuestion =
          //       (quiz.question && quiz.question.trim()) || quiz.questionId
          //     const hasValidOptions =
          //       quiz.options &&
          //       quiz.options.length >= 2 &&
          //       quiz.options.every(
          //         (opt: any) => opt && opt.text && opt.text.trim()
          //       )
          //     console.log('Filtering quiz:', {
          //       quiz,
          //       hasQuestion,
          //       hasValidOptions,
          //       willInclude: hasQuestion && hasValidOptions,
          //     })
          //     return hasQuestion && hasValidOptions
          //   })
          //   .map((quiz: any) => ({
          //     questionId: quiz.questionId || undefined,
          //     question: quiz.question || '',
          //     options: Array.isArray(quiz.options)
          //       ? quiz.options.map((opt: any) => ({
          //           text: typeof opt === 'string' ? opt : opt?.text || '',
          //         }))
          //       : [],
          //     correctAnswer: quiz.correctAnswer ?? null,
          //     points: quiz.points || 10,
          //   }))

          // console.log('Updating match with quizzes:', {
          //   quizzesCount: quizzesForApi.length,
          //   quizzes: quizzesForApi,
          // })

          const updateResponse = await retry(
            () =>
              updateMatch(editingMatchId.value!, {
                matchNumber: matchToUpdate.matchNumber,
                matchName: matchToUpdate.matchName,
                teamA:
                  typeof matchToUpdate.teamA === 'string'
                    ? matchToUpdate.teamA
                    : matchToUpdate.teamA.id,
                teamB:
                  typeof matchToUpdate.teamB === 'string'
                    ? matchToUpdate.teamB
                    : matchToUpdate.teamB.id,
                matchTime: matchToUpdate.matchTime,
                status: matchToUpdate.status,
                score: matchToUpdate.score,
                participantsCount: matchToUpdate.participantsCount,
                participants: matchToUpdate.participants,
                players: playersForApi,
                quizzes: quizzesForApi,
              }),
            { maxRetries: 2 }
          )

          console.log('Update response:', updateResponse)

          if (updateResponse?.data) {
            const updatedMatch = updateResponse.data as Match
            console.log('Updated match from API:', {
              id: updatedMatch.id,
              quizzesCount: updatedMatch.quizzes?.length,
              quizzes: updatedMatch.quizzes,
            })

            const index = matches.value.findIndex(
              m => m.id === editingMatchId.value
            )
            if (index !== -1) {
              matches.value[index] = updatedMatch
              if (selectedMatch.value?.id === editingMatchId.value) {
                selectedMatch.value = { ...updatedMatch }
              }
            }
          }

          success('Match updated successfully')
          console.log('Composable: Match updated, clearing editingMatchId')
          editingMatchId.value = null
          await loadMatches()
          return true
        } catch (err: any) {
          console.error('Composable: Failed to update match:', err)
          Object.assign(matchToUpdate, previousData)

          const errorMessage = getApiErrorMessage(err)
          showError(errorMessage)
          return false
        }
      } else {
        // Temporary placeholder - will be replaced by API response
        const newMatch: Match = {
          id: Date.now().toString(),
          matchNumber: parseInt(form.value.matchNumber, 10),
          matchName: form.value.matchName?.trim() || undefined,
          teamA: { id: form.value.teamA.trim(), name: '', imageUrl: '' },
          teamB: { id: form.value.teamB.trim(), name: '', imageUrl: '' },
          matchTime: new Date(form.value.matchTime).toISOString(),
          status: form.value.status,
          score: form.value.score?.trim() || undefined,
          participantsCount: 0,
          participants: [],
          players: form.value.players,
          // quizzes: form.value.quizzes,
        }

        matches.value.push(newMatch)

        try {
          const playersResponse = await $fetch<{ data: any[] }>('/api/players')
          const allPlayers = (playersResponse.data || []).map(
            (player: any) => ({
              id: player._id || player.id,
              name: player.name,
            })
          )

          const playerNameToIdMap = new Map<string, string>()
          allPlayers.forEach(player => {
            playerNameToIdMap.set(player.name, player.id)
          })

          const convertPlayerNamesToIds = (playerNames: string[]): string[] => {
            return playerNames
              .map(name => playerNameToIdMap.get(name))
              .filter((id): id is string => id !== undefined)
          }

          const playersForApi = {
            teamA: convertPlayerNamesToIds(form.value.players?.teamA || []),
            teamB: convertPlayerNamesToIds(form.value.players?.teamB || []),
          }

          if (playersForApi.teamA.length === 0) {
            showError('At least one player is required for Team A')
            const index = matches.value.findIndex(m => m.id === newMatch.id)
            if (index !== -1) {
              matches.value.splice(index, 1)
            }
            submitting.value = false
            return false
          }

          if (playersForApi.teamB.length === 0) {
            showError('At least one player is required for Team B')
            const index = matches.value.findIndex(m => m.id === newMatch.id)
            if (index !== -1) {
              matches.value.splice(index, 1)
            }
            submitting.value = false
            return false
          }

          const quizzesForApi: any[] = []
          // const quizzesForApi = (newMatch.quizzes || [])
          //   .filter((quiz: any) => {
          //     // Include quiz if it has a question or questionId AND has at least 2 options with text
          //     const hasQuestion =
          //       (quiz.question && quiz.question.trim()) || quiz.questionId
          //     const hasValidOptions =
          //       quiz.options &&
          //       quiz.options.length >= 2 &&
          //       quiz.options.every(
          //         (opt: any) => opt && opt.text && opt.text.trim()
          //       )
          //     return hasQuestion && hasValidOptions
          //   })
          //   .map((quiz: any) => ({
          //     questionId: quiz.questionId || undefined,
          //     question: quiz.question || '',
          //     options: Array.isArray(quiz.options)
          //       ? quiz.options.map((opt: any) => ({
          //           text: typeof opt === 'string' ? opt : opt?.text || '',
          //         }))
          //       : [],
          //     correctAnswer: quiz.correctAnswer ?? null,
          //     points: quiz.points || 10,
          //   }))

          const createResponse = await retry(
            () =>
              createMatch({
                matchNumber: newMatch.matchNumber,
                ...(newMatch.matchName && { matchName: newMatch.matchName }),
                teamA: newMatch.teamA.id,
                teamB: newMatch.teamB.id,
                matchTime: newMatch.matchTime,
                status: newMatch.status,
                score: newMatch.score,
                players: playersForApi,
                quizzes: quizzesForApi,
              }),
            { maxRetries: 2 }
          )

          console.log('Create response:', createResponse)

          if (createResponse?.data) {
            const createdMatch = createResponse.data as Match
            const index = matches.value.findIndex(m => m.id === newMatch.id)
            if (index !== -1) {
              matches.value[index] = createdMatch
            }
          }

          success('Match created successfully')
          if (showModal.value) {
            closeModal()
          }
          await loadMatches()
          return true
        } catch (err: any) {
          console.error('Failed to create match:', err)
          const index = matches.value.findIndex(m => m.id === newMatch.id)
          if (index !== -1) {
            matches.value.splice(index, 1)
          }

          const errorMessage = getApiErrorMessage(err)
          showError(errorMessage)
          return false
        }
      }
    } finally {
      submitting.value = false
    }
    return false
  }

  const initializeEditForm = async (match: Match) => {
    editingMatchId.value = match.id
    const matchTimeDate = new Date(match.matchTime)
    const localDateTime = new Date(
      matchTimeDate.getTime() - matchTimeDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16)

    // const quizzes = (match.quizzes || []).map(quiz => ({
    //   questionId: quiz.questionId || '',
    //   question: quiz.question || '',
    //   options: Array.isArray(quiz.options)
    //     ? quiz.options.map((opt: any) => ({
    //         text: typeof opt === 'string' ? opt : opt?.text || '',
    //       }))
    //     : [],
    //   correctAnswer: quiz.correctAnswer ?? null,
    //   points: quiz.points || 10,
    //   saved: true,
    // }))
    const quizzes: any[] = []

    let playerNames = { teamA: [] as string[], teamB: [] as string[] }

    if (match.players) {
      try {
        const playersResponse = await $fetch<{ data: any[] }>('/api/players')
        const allPlayers = (playersResponse.data || []).map((player: any) => ({
          id: player._id || player.id,
          name: player.name,
        }))

        const playerIdToNameMap = new Map<string, string>()
        allPlayers.forEach(player => {
          playerIdToNameMap.set(player.id, player.name)
        })

        const convertPlayerIdsToNames = (
          playerIds: Array<string | { id: string; name: string; _id?: string }>
        ): string[] => {
          return playerIds
            .map(item => {
              // If it's already a player object with name, return the name
              if (typeof item === 'object' && item.name) {
                return item.name
              }
              // Otherwise treat as ID
              const id = String(item)
              const name = playerIdToNameMap.get(id)
              if (name) return name
              if (id.length > 0) {
                const found = allPlayers.find(
                  p => p.id === id || p.id?.toString() === id
                )
                return found?.name || ''
              }
              return ''
            })
            .filter(name => name.length > 0)
        }

        playerNames = {
          teamA: convertPlayerIdsToNames(match.players.teamA || []),
          teamB: convertPlayerIdsToNames(match.players.teamB || []),
        }
      } catch (error) {
        console.error('Failed to fetch players for form initialization:', error)
        playerNames = {
          teamA: Array.isArray(match.players.teamA)
            ? match.players.teamA
                .map((p: any) => {
                  if (typeof p === 'string') return p
                  if (p && typeof p === 'object' && p.name) return p.name
                  return ''
                })
                .filter((n: string) => n)
            : [],
          teamB: Array.isArray(match.players.teamB)
            ? match.players.teamB
                .map((p: any) => {
                  if (typeof p === 'string') return p
                  if (p && typeof p === 'object' && p.name) return p.name
                  return ''
                })
                .filter((n: string) => n)
            : [],
        }
      }
    }

    form.value = {
      matchNumber: match.matchNumber.toString(),
      matchName: match.matchName || '',
      teamA: typeof match.teamA === 'string' ? match.teamA : match.teamA.id,
      teamB: typeof match.teamB === 'string' ? match.teamB : match.teamB.id,
      matchTime: localDateTime,
      status: match.status,
      score: match.score || '',
      players: playerNames,
      // quizzes: quizzes,
    }

    console.log('Composable: Initialized edit form for match', match.id, {
      teamA: form.value.teamA,
      teamB: form.value.teamB,
      players: form.value.players,
      quizzes: quizzes.length,
    })
  }

  watch(
    () => route.path,
    path => {
      if (path !== '/matches') {
        if (selectedMatch.value && !path.includes('/matches')) {
          selectedMatch.value = null
        }
        return
      }
    },
    { immediate: true }
  )

  const handleDelete = async (matchId: string) => {
    submitting.value = true

    try {
      await retry(() => deleteMatch(matchId), { maxRetries: 2 })

      const index = matches.value.findIndex(m => m.id === matchId)
      if (index !== -1) {
        matches.value.splice(index, 1)
      }

      if (selectedMatch.value?.id === matchId) {
        selectedMatch.value = null
      }

      success('Match deleted successfully')
      router.push('/matches')
      return true
    } catch (err: any) {
      const errorMessage = getApiErrorMessage(err)
      showError(errorMessage)
      return false
    } finally {
      submitting.value = false
    }
  }

  return {
    matches,
    loading,
    error,
    selectedMatch,
    navigateToMatch,
    closeMatchDetail,
    loadMatches,
    showModal,
    submitting,
    form,
    editingMatchId,
    openAddModal,
    closeModal,
    handleSubmit,
    initializeEditForm,
    handleDelete,
  }
}
