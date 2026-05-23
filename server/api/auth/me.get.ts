export default defineEventHandler(async (event) => {
  // Simple mock response for local development to bypass production auth/me
  return {
    success: true,
    data: {
      user: {
        _id: '67c0602f37e1a38fc2909185',
        firebaseUid: 'rFy9tcZfANWjxwY6fu2b0s4O2D12',
        email: 'mockuser@example.com',
        displayName: 'OK11 Dev User',
        role: 'user',
        blocked: false
      }
    }
  }
})
