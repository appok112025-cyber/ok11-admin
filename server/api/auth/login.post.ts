import type { LoginRequest, LoginResponse } from '@/types/auth'
import { backendApiRequest } from '../../utils/backendApi'

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  try {
    const body = await readBody<LoginRequest>(event)

    if (!body.email || !body.password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required',
      })
    }

    const email = body.email.trim().toLowerCase()
    const password = body.password

    const response = await backendApiRequest<{
      success: boolean
      message: string
      data: {
        token: string
        admin: {
          id: string
          email: string
          role: string
        }
      }
    }>(event, '/api/auth/admin/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })

    if (!response.success || !response.data) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials',
      })
    }

    const { token, admin } = response.data
    const expiresIn = body.rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60
    const tokenExpiration = Math.floor(Date.now() / 1000) + expiresIn

    setCookie(event, 'refreshToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    setCookie(
      event,
      'auth_user',
      JSON.stringify({
        id: admin.id,
        email: admin.email,
        name: admin.email,
        role: admin.role,
      }),
      {
        httpOnly: false, // Must be false so client can read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed to lax for better compatibility
        maxAge: body.rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
        path: '/',
      }
    )

    setCookie(event, 'auth_token', token, {
      httpOnly: false, // Must be false so client can read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed to lax for better compatibility
      maxAge: body.rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/',
    })

    setCookie(event, 'auth_expires', tokenExpiration.toString(), {
      httpOnly: false, // Must be false so client can read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed to lax for better compatibility
      maxAge: body.rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
      path: '/',
    })

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.email,
          role: admin.role,
        },
        token,
        refreshToken: token,
        expiresIn: tokenExpiration,
      },
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred. Please try again.',
    })
  }
})
