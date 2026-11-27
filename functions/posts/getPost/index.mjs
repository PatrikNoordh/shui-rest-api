/**
 * GET /posts/{postId} — returns one post.
 */
import middy from '@middy/core';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { getPost } from '../../../services/posts.mjs';
import { sendResponse } from '../../../utils/responses.mjs';

/**
 * Returns the post with the id in the path.
 * @returns 200 with the post; 404 / 500 via errorHandler.
 */
export const handler = middy(async (event) => {
  const post = await getPost(event.pathParameters.postId);
  return sendResponse(200, post);
}).use(errorHandler());
