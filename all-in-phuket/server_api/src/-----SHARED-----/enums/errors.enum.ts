export enum Err {
  INVALID_emailVerificationToken = 'Invalid email verification token',
  INVALID_PASSWORD = 'Invalid password',

  TOKEN_EXPIRED = 'Token expired',
  TOKEN_NULL = 'No token',

  USER_ALREADY_EXISTS = 'User already exists',
  USER_NOT_FOUND = 'User not found',

  USER_NOT_EVENT_CREATOR = 'User is not event creator',
  USER_NOT_PLACE_CREATOR = 'User is not place creator',
  USER_PLACE_LIMIT = 'User has reached business add limit',
}
