/**
 * Business logic for registering and logging in users.
 */
import bcrypt from 'bcryptjs';
import { createError } from '@middy/util';
import { createUser } from '../db/users.mjs';

/**
 * Registers a new user with a hashed password.
 * @param {{ username: string, password: string }} credentials already validated (trimmed, lowercased)
 * @returns {Promise<{ username: string }>}
 * @throws 409 if the username is already taken
 */
export const registerUser = async ({ username, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  try {
    await createUser(user);
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw createError(409, 'Username is already taken');
    }
    throw error;
  }

  return { username };
};
