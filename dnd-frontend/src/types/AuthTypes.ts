export interface AuthRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
}

export interface ApiError {
  message: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordRequest {
  username: string
  newPassword: string
}
