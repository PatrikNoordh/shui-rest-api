/**
 * DELETE /posts/{postId} — the owner deletes a post.
 */
import middy from '@middy/core';
import { authenticate } from '../../middlewares/authenticate.mjs';
import { authorizePostOwner } from '../../middlewares/authorizePostOwner.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';
import { removePost } from '../../services/posts.mjs';
import { sendResponse } from '../../utils/responses.mjs';

/**
 * Deletes the post in the path for its owner.
 * @returns 204 without a body; 401 / 403 / 404 / 500 via errorHandler.
 */
export const handler = middy(async (event) => {
  await removePost(event.post.id);
  return sendResponse(204);
})
  .use(authenticate())
  .use(authorizePostOwner())
  .use(errorHandler());
