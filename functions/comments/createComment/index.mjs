/**
 * POST /posts/{postId}/comments: a logged-in user comments on a post.
 */
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { authenticate } from '../../../middlewares/authenticate.mjs';
import { validate } from '../../../middlewares/validate.mjs';
import { errorHandler } from '../../../middlewares/errorHandler.mjs';
import { commentSchema } from '../../../schemas/commentSchema.mjs';
import { addComment } from '../../../services/comments.mjs';
import { sendResponse } from '../../../utils/responses.mjs';

/**
 * Creates a comment as the user in the token.
 * @returns 201 with { message, comment }; 400 / 401 / 404 / 500 via errorHandler.
 */
export const handler = middy(async (event) => {
  const comment = await addComment({
    postId: event.pathParameters.postId,
    username: event.user.username,
    content: event.body.content,
  });

  return sendResponse(201, { message: 'Comment created successfully', comment });
})
  .use(authenticate())
  .use(httpJsonBodyParser())
  .use(validate(commentSchema))
  .use(errorHandler());
