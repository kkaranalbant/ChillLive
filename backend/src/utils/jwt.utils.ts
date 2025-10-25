import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  isGuest: boolean;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
  const expiry = process.env.JWT_ACCESS_EXPIRY || '15m';

  return jwt.sign(payload, secret, { expiresIn: expiry });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  const expiry = process.env.JWT_REFRESH_EXPIRY || '7d';

  return jwt.sign(payload, secret, { expiresIn: expiry });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
  return jwt.verify(token, secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  return jwt.verify(token, secret) as TokenPayload;
};
