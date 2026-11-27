/**
 * GET /posts/{postId}/comments — anyone can read the comments of a post.
 */
import middy from '@middy/core';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { listComments } from '../../../services/comments.mjs';
import { sendResponse } from '../../../utils/responses.mjs';

/**
 * Lists the comments of one post, oldest first.
 * @returns 200 with an array (can be []); 404 / 500 via errorHandler.
 */
export const handler = middy(async (event) => {
  const comments = await listComments(event.pathParameters.postId);
  return sendResponse(200, comments);
}).use(errorHandler());
