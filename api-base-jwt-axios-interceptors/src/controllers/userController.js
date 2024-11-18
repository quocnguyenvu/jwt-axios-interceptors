import { StatusCodes } from 'http-status-codes'
import {
  ACCESS_TOKEN_SECRET_SIGNATURE,
  JWTProvider,
  REFRESH_TOKEN_SECRET_SIGNATURE
} from '~/providers/JwtProvider'

const MOCK_DATABASE = {
  USER: {
    ID: '123',
    EMAIL: '123',
    PASSWORD: '123'
  }
}

const login = async (req, res) => {
  try {
    if (
      req.body.email !== MOCK_DATABASE.USER.EMAIL ||
      req.body.password !== MOCK_DATABASE.USER.PASSWORD
    ) {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: 'Your email or password is incorrect!' })
      return
    }
    const userInfo = {
      id: MOCK_DATABASE.USER.ID,
      email: MOCK_DATABASE.USER.EMAIL
    }

    const accessToken = await JWTProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
    )

    const refreshToken = await JWTProvider.generateToken(
      userInfo,
      REFRESH_TOKEN_SECRET_SIGNATURE,
      '14 days'
    )

    res.status(StatusCodes.OK).json({
      ...userInfo,
      accessToken,
      refreshToken
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken
    const refreshTokenDecoded = await JWTProvider.verifyToken(
      refreshToken,
      REFRESH_TOKEN_SECRET_SIGNATURE
    )
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshToken.email
    }
    const accessToken = await JWTProvider.generateToken(
      userInfo,
      ACCESS_TOKEN_SECRET_SIGNATURE,
      '1h'
    )
    res.status(StatusCodes.OK).json({ accessToken })
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Refresh token failed!' })
  }
}

export const userController = {
  login,
  refreshToken
}
