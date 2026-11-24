/**
 * POST /auth/register — creates a new user.
 */
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { validate } from '../../middlewares/validate.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';
import { credentialsSchema } from '../../schemas/authSchema.mjs';
import { registerUser } from '../../services/auth.mjs';
import { sendResponse } from '../../utils/responses.mjs';

/**
 * Registers a user with a unique username and a hashed password.
 * @returns 201 with { message, username }; 400 / 409 / 500 via errorHandler.
 */
export const handler = middy(async (event) => {
  const { username } = await registerUser(event.body);
  return sendResponse(201, { message: 'User registered successfully', username });
})
  .use(httpJsonBodyParser())
  .use(validate(credentialsSchema))
  .use(errorHandler());
