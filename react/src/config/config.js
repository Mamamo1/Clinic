// Configuration file for NU-CARES application
const config = {
  // API Configuration
  API_BASE_URL: "http://localhost:8000/api",

  // Security Configuration
  TOKEN_STORAGE_KEY: "nu_cares_token",
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  REQUEST_TIMEOUT: 10000, // 10 seconds

  // Environment Configuration
  IS_PRODUCTION: import.meta.env.PROD,
  SECURE_COOKIES: import.meta.env.PROD, // Use secure cookies in production

  // CORS Configuration
  ALLOWED_ORIGINS: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],

  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Session Configuration
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry

  // Validation Rules
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 254,

  // Campus Configuration
  DEFAULT_CAMPUS: "NU Lipa",
  AVAILABLE_CAMPUSES: ["NU Lipa"],
}

export default config
