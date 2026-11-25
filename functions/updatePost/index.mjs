/**
 * PUT /posts/{postId} — the owner changes title and content.
 */
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { authenticate } from '../../middlewares/authenticate.mjs';
import { validate } from '../../middlewares/validate.mjs';
import { authorizePostOwner } from '../../middlewares/authorizePostOwner.mjs';
import { errorHandler } from '../../middlewares/errorHandler.mjs';
import { postSchema } from '../../schemas/postSchema.mjs';
import { editPost } from '../../services/posts.mjs';
import { sendResponse } from '../../utils/responses.mjs';

/**
 * Updates the post in the path for its owner.
 * @returns 200 with { message, post }; 400 / 401 / 403 / 404 / 500 via errorHandler.
 */
export const handler = middy(async (event) => {
  const post = await editPost(event.post.id, event.body);
  return sendResponse(200, { message: 'Post updated successfully', post });
})
  .use(authenticate())
  .use(httpJsonBodyParser())
  .use(validate(postSchema))
  .use(authorizePostOwner())
  .use(errorHandler());
