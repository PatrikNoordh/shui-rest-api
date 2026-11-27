/**
 * GET /posts — lists all posts, or the posts of one user.
 */
import middy from '@middy/core';
import { validate } from '../../../middlewares/validate.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { postsQuerySchema } from '../../../schemas/postSchema.mjs';
import { listPosts } from '../../../services/posts.mjs';
import { sendResponse } from '../../../utils/responses.mjs';

/**
 * Lists posts, newest first, with an optional ?username= filter.
 * @returns 200 with an array of posts; 400 / 500 via errorHandler.
 */
export const handler = middy(async (event) => {
  const posts = await listPosts(event.queryStringParameters.username);
  return sendResponse(200, posts);
})
  .use(validate(postsQuerySchema, 'queryStringParameters'))
  .use(errorHandler());
