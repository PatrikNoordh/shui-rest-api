/**
 * Middy middleware that requires a valid JWT and puts the user on event.user.
 */
import { createError } from '@middy/util';
import { verifyToken } from '../utils/jwt.mjs';

/**
 * Verifies the Bearer token in the Authorization header.
 * Sets event.user = { username } for a valid token; otherwise stops the request with 401.
 */
export const authenticate = () => ({
  before: async (request) => {
    const header = request.event.headers?.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw createError(401, 'Missing token');
    }

    let payload;
    try {
      payload = verifyToken(header.slice('Bearer '.length));
    } catch {
      throw createError(401, 'Invalid or expired token');
    }
    request.event.user = { username: payload.username };
  },
});
