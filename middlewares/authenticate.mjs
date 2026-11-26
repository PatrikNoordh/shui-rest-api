/**
 * Middy middleware that checks the JWT and puts the user on event.user.
 */
import { createError } from '@middy/util';
import { verifyToken } from '../utils/jwt.mjs';

/**
 * Verifies the Bearer token in the Authorization header.
 * Sets event.user = { username } for a valid token; otherwise stops the request with 401.
 * With optional: true, a request without an Authorization header continues as a guest (event.user = null).
 * @param {{ optional?: boolean }} [options]
 */
export const authenticate = ({ optional = false } = {}) => ({
  before: async (request) => {
    const header = request.event.headers?.authorization;

    if (!header && optional) {
      request.event.user = null;
      return;
    }

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
