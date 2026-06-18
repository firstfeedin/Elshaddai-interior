import jwt    from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'

export const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '15m' })

export const signRefreshToken = () => uuid()

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('accessToken', accessToken, {
    httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 15 * 60 * 1000
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: isProd, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
}
