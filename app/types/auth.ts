export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthTokens {
  token: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe: boolean
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
    token: string
    refreshToken: string
    expiresIn: number
  }
}

export interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}
