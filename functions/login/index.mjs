/**
 * POST /auth/login — checks credentials and returns a JWT.
 */
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { validate } from '../../middlewares/validate.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';
import { credentialsSchema } from '../../schemas/authSchema.mjs';
import { loginUser } from '../../services/auth.mjs';
import { sendResponse } from '../../utils/responses.mjs';

/**
 * Logs a user in.
 * @returns 200 with { message, token, username }; 400 / 401 / 500 via errorHandler.
 */
export const handler = middy(async (event) => {
  const { token, username } = await loginUser(event.body);
  return sendResponse(200, { message: 'Login successful', token, username });
})
  .use(httpJsonBodyParser())
  .use(validate(credentialsSchema))
  .use(errorHandler());
