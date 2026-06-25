import { randomUUID } from 'crypto';

import type { FastifyRequest } from 'fastify';
import { decodeJwt, jwtVerify, SignJWT } from 'jose';

import { Err } from '../-----SHARED-----/enums/errors.enum';
import type { Token } from '../types/auth.type';

import { status } from './status.util';

const SECRET = new TextEncoder().encode('JWT_SECRET_REDACTED');

export async function createAccessToken(payload: { id: number; email: string }) {
  const token = new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    // .setExpirationTime('30m')
    .setExpirationTime('2d')
    // .setExpirationTime('20s')
    .sign(SECRET);
  return token;
}

export const createRefreshToken = () => {
  return randomUUID().replace(/-/g, '').slice(0, 20);
};

export async function getAccessTokenInit(req: FastifyRequest) {
  const jwt = req.headers.authorization;
  if (!jwt) return;
  let token: Token;
  try {
    token = (await jwtVerify<Token>(jwt, SECRET)).payload;
  } catch (err) {
    throw status(401, Err.TOKEN_EXPIRED);
  }
  return token;
}

export async function getAccessToken(req: FastifyRequest) {
  const token = req.headers.authorization;
  if (!token) throw status(401, Err.TOKEN_NULL);
  let tokenObj: Token;
  try {
    tokenObj = (await jwtVerify<Token>(token, SECRET)).payload;
  } catch (err) {
    throw status(401, Err.TOKEN_EXPIRED);
  }
  return { ...tokenObj, id: Number(tokenObj.id) };
}

export async function getAccessTokenString(token: string | undefined) {
  if (!token) throw status(401, Err.TOKEN_NULL);
  let tokenObj: Token;
  try {
    tokenObj = (await jwtVerify<Token>(token, SECRET)).payload;
  } catch (err) {
    throw status(401, Err.TOKEN_EXPIRED);
  }
  return { ...tokenObj, id: Number(tokenObj.id) };
}

export async function isTokenExpired(req: FastifyRequest) {
  const jwt = req.headers.authorization;
  if (!jwt) throw status(401, Err.TOKEN_NULL);
  const is_ERR_JWT_EXPIRED = await jwtVerify(jwt, SECRET).catch((err) => err.code);
  const token = decodeJwt<Token>(jwt);
  if (is_ERR_JWT_EXPIRED === 'ERR_JWT_EXPIRED') {
    return { token, expired: true };
  }
  return { token, expired: false };
}
