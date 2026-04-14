import type { SiteContent, SiteContentResponse } from '~/types/site-content'

export const useSiteContent = () => {
  const getSiteContent = async (): Promise<SiteContentResponse> => {
    return await $fetch<SiteContentResponse>('/api/site-content')
  }

  const updateSiteContent = async (
    data: SiteContent
  ): Promise<SiteContentResponse> => {
    return await $fetch<SiteContentResponse>('/api/site-content', {
      method: 'PUT',
      body: data,
    })
  }

  return {
    getSiteContent,
    updateSiteContent,
  }
}
