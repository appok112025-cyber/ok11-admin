import { ref } from 'vue'
import { useToast } from '../common/useToast'

interface Quiz {
  id: string
  question: string
}

/**
 * Composable for fetching quizzes
 */
export const useQuizzes = () => {
  const quizzes = ref<Quiz[]>([])
  const isLoading = ref(false)
  const { error: showError } = useToast()

  const fetchQuizzes = async () => {
    isLoading.value = true
    try {
      const response = await $fetch<{ data: any[] }>('/api/quizzes')
      if (response.data) {
        quizzes.value = response.data.map((quiz: any) => ({
          id: quiz._id || quiz.id,
          question: quiz.question,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
      showError('Failed to fetch quizzes')
    } finally {
      isLoading.value = false
    }
  }

  return {
    quizzes,
    isLoading,
    fetchQuizzes,
  }
}
