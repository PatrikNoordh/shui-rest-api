/**
 * Creates and checks the JSON Web Tokens the API uses for logged-in users.
 */
import jwt from 'jsonwebtoken';

/**
 * Signs a token for a logged-in user. Valid for one hour.
 * @param {string} username
 * @returns {string} the token, e.g. "eyJhbGciOiJIUzI1NiIs..."
 */
export const signToken = (username) =>
  jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });

/**
 * Verifies a token and returns its payload.
 * Throws if the signature is wrong, the token is broken or it has expired.
 * @param {string} token
 * @returns {{ username: string, iat: number, exp: number }}
 */
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);
