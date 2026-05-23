export default defineEventHandler(async (event) => {
  return {
    success: true,
    message: 'FCM token updated'
  }
})
