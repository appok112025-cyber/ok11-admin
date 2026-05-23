export default defineEventHandler(async (event) => {
  return {
    success: true,
    data: {
      data: [],
      total: 0,
      page: 1,
      limit: 100
    }
  }
})
