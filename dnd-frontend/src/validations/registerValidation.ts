export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

export const validateUsername = (username: string): string | null => {
  if (!username.trim()) return 'Username is required'
  return null
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = []

  if (!password) {
    errors.push('Password is required')
  } else {
    const rules: { regex: RegExp; message: string }[] = [
      { regex: /.{6,}/, message: 'At least 6 characters' },
      { regex: /[0-9]/, message: 'Include a number' },
      { regex: /[a-z]/, message: 'Include a lowercase letter' },
      { regex: /[A-Z]/, message: 'Include an uppercase letter' },
      { regex: /[^A-Za-z0-9]/, message: 'Include a special symbol' },
    ]

    rules.forEach(rule => {
      if (!rule.regex.test(password)) errors.push(rule.message)
    })
  }

  return { valid: errors.length === 0, errors }
}

export const validateRegisterForm = (username: string, password: string) => {
  const usernameError = validateUsername(username)
  const passwordResult = validatePassword(password)

  const errors: { username?: string; password?: string } = {}
  if (usernameError) errors.username = usernameError
  if (!passwordResult.valid) errors.password = passwordResult.errors.join(', ')

  return { valid: Object.keys(errors).length === 0, errors }
}
