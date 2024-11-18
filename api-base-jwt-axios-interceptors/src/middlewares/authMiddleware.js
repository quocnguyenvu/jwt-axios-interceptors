import { StatusCodes } from 'http-status-codes'
import {
  ACCESS_TOKEN_SECRET_SIGNATURE,
  JWTProvider
} from '~/providers/JwtProvider'

const isAuthorized = async (req, res, next) => {
  const accessToken = req.headers?.authorization
  if (!accessToken) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Authorized! (Token not found)' })
    return
  }

  try {
    const accessTokenDecoded = await JWTProvider.verifyToken(
      accessToken.substring('Bearer '.length),
      ACCESS_TOKEN_SECRET_SIGNATURE
    )
    req.jwtDecoded = accessTokenDecoded
    next()
  } catch (error) {
    if (error.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json({ message: 'Need to refresh token.' })
      return
    }
    res.status(StatusCodes.GONE).json({ message: 'Authorized! Please login.' })
  }
}

export const authMiddleware = {
  isAuthorized
}
