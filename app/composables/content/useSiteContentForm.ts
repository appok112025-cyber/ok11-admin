import type {
  AboutData,
  PointsData,
  TermsData,
  SiteContentResponse,
} from '~/types/site-content'
import { retry } from '~/utils/common/retry'
import { getApiErrorMessage, useApi } from '~/utils/api/api'
import { useRequestCancellation } from '../common/useRequestCancellation'
import { useToast } from '../common/useToast'

export const useSiteContentForm = <
  T extends AboutData | PointsData | TermsData,
>(
  contentType: 'about' | 'points' | 'terms'
) => {
  const { getSiteContent, updateSiteContent } = useApi()
  const { success, error: showError } = useToast()
  const { createAbortController } = useRequestCancellation()

  const getInitialData = (): T => {
    if (contentType === 'about') {
      return {
        content: '',
        links: [],
      } as unknown as T
    } else {
      return {
        content: '',
        items: [],
      } as unknown as T
    }
  }

  const formData = ref<T>(getInitialData())
  const originalData = ref<T>(getInitialData())

  const isLoading = ref(false)
  const loading = ref(true)

  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true
    if (obj1 == null || obj2 == null) return obj1 === obj2
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
      return obj1 === obj2

    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false
      for (let i = 0; i < obj1.length; i++) {
        if (!deepEqual(obj1[i], obj2[i])) return false
      }
      return true
    }

    if (Array.isArray(obj1) || Array.isArray(obj2)) return false

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    for (const key of keys1) {
      if (!keys2.includes(key)) return false
      if (!deepEqual(obj1[key], obj2[key])) return false
    }

    return true
  }

  const hasChanges = computed(() => {
    if (loading.value) return false
    return !deepEqual(formData.value, originalData.value)
  })

  const loadData = async () => {
    loading.value = true
    const abortController = createAbortController()

    try {
      const response = await retry(() => getSiteContent(), {
        maxRetries: 2,
        retryCondition: (err: any) => {
          if (abortController.signal.aborted) return false
          return !err.status || (err.status >= 500 && err.status < 600)
        },
      })

      if (abortController.signal.aborted) return

      // Handle edge cases: null, undefined, or missing data
      if (response?.data) {
        // The response structure is: { data: { about: { content, links }, points: { content, items }, terms: { content, items } }, meta: {} }
        const responseData = response.data as any
        let apiData: any

        // Check if response.data has a nested data property (SiteContentResponse structure)
        if (responseData.data && typeof responseData.data === 'object') {
          apiData = responseData.data
        } else if (
          responseData.about !== undefined ||
          responseData.points !== undefined ||
          responseData.terms !== undefined
        ) {
          // response.data is already the site content object
          apiData = responseData
        } else {
          // Fallback: try response.data.data
          apiData = (responseData as SiteContentResponse)?.data || responseData
        }

        // Validate apiData structure
        if (!apiData || typeof apiData !== 'object') {
          console.warn('API returned invalid data structure for site content', {
            response,
            apiData,
          })
          // Use default empty data
          formData.value = getInitialData()
          originalData.value = getInitialData()
          return
        }

        let data: T

        // Extract real data from API response
        if (contentType === 'about') {
          const aboutData = apiData.about || {}
          data = {
            content: aboutData.content ?? '',
            links: Array.isArray(aboutData.links) ? aboutData.links : [],
          } as unknown as T
        } else if (contentType === 'points') {
          const pointsData = apiData.points || {}
          // Ensure items is always an array, even if empty
          const items = Array.isArray(pointsData.items) ? pointsData.items : []
          data = {
            content: pointsData.content ?? '',
            items: items, // Can be empty array
          } as unknown as T
        } else {
          const termsData = apiData.terms || {}
          data = {
            content: termsData.content ?? '',
            items: Array.isArray(termsData.items) ? termsData.items : [],
          } as unknown as T
        }

        formData.value = JSON.parse(JSON.stringify(data))
        originalData.value = JSON.parse(JSON.stringify(data))
      } else {
        // No data returned - use default initial data
        formData.value = getInitialData()
        originalData.value = getInitialData()
      }
    } catch (err: any) {
      if (abortController.signal.aborted) return

      const errorMessage = getApiErrorMessage(err)
      showError(errorMessage)
    } finally {
      if (!abortController.signal.aborted) {
        loading.value = false
      }
    }
  }

  const saveData = async () => {
    isLoading.value = true

    // Optimistic update
    const previousData = JSON.parse(JSON.stringify(originalData.value))
    originalData.value = JSON.parse(JSON.stringify(formData.value))

    try {
      let updatePayload: any = {}

      // Send the full data structure for the current content type
      if (contentType === 'about') {
        updatePayload.about = {
          content: formData.value.content,
          links: (formData.value as AboutData).links || [],
        }
      } else if (contentType === 'points') {
        // Ensure items is always an array (can be empty when all points are deleted)
        const items = Array.isArray((formData.value as PointsData).items)
          ? (formData.value as PointsData).items
          : []
        updatePayload.points = {
          content: formData.value.content || '',
          items: items, // Can be empty array
        }
      } else {
        updatePayload.terms = {
          content: formData.value.content,
          items: (formData.value as TermsData).items || [],
        }
      }

      const updateResponse = await retry(
        () => updateSiteContent(updatePayload),
        { maxRetries: 2 }
      )

      // Validate response
      if (!updateResponse?.data) {
        throw new Error('Invalid response from server')
      }

      const successMessages: Record<string, string> = {
        about: 'About page saved successfully',
        points: 'Points system saved successfully',
        terms: 'Terms & conditions saved successfully',
      }
      success(
        successMessages[contentType] ||
          `${contentType} content updated successfully`
      )
    } catch (err: any) {
      // Rollback optimistic update
      originalData.value = previousData

      const errorMessage = getApiErrorMessage(err)
      showError(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  return {
    formData,
    originalData,
    isLoading,
    loading,
    hasChanges,
    loadData,
    saveData,
  }
}
