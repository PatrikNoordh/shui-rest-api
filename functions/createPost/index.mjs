/**
 * POST /posts — a logged-in user or a guest creates a post.
 */
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { authenticate } from '../../middlewares/authenticate.mjs';
import { validate } from '../../middlewares/validate.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';
import { postSchema } from '../../schemas/postSchema.mjs';
import { addPost } from '../../services/posts.mjs';
import { generateGuestName } from '../../utils/guestName.mjs';
import { sendResponse } from '../../utils/responses.mjs';

/**
 * Creates a post for the user in the verified token, or a guest post when there is no token.
 * @returns 201 with { message, post }; 400 / 401 / 500 via errorHandler.
 */
export const handler = middy(async (event) => {
  const isGuest = event.user === null;

  const post = await addPost({
    username: isGuest ? generateGuestName() : event.user.username,
    isGuest,
    title: event.body.title,
    content: event.body.content,
  });
  return sendResponse(201, { message: 'Post created successfully', post });
})
  .use(authenticate({ optional: true }))
  .use(httpJsonBodyParser())
  .use(validate(postSchema))
  .use(errorHandler());
