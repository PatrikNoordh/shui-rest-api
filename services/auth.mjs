/**
 * Business logic for registering and logging in users.
 */
import bcrypt from 'bcryptjs';
import { createError } from '@middy/util';
import { createUser, getUser } from '../db/users.mjs';
import { signToken } from '../utils/jwt.mjs';

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

// A random bcrypt hash string that is not any user's password.
// Used when the username doesn't exist, so that both paths run one bcrypt.compare
// and take the same time.
const DUMMY_HASH = '$2b$10$vauTV6lRjT5wN./JKM4UC.xn8txawuIG.2B6rlB9bdpdxMvtJ5eAS';

/**
 * Checks username and password and returns a signed token.
 * Always runs one bcrypt comparison, so an unknown username takes as long as a wrong password.
 * @param {{ username: string, password: string }} credentials already validated (trimmed, lowercased)
 * @returns {Promise<{ token: string, username: string }>}
 * @throws 401 if the user doesn't exist or the password is wrong — the same message for both
 */
export const loginUser = async ({ username, password }) => {
  const user = await getUser(username);

  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw createError(401, 'Invalid username or password');
  }
  return { token: signToken(user.username), username: user.username };
};
