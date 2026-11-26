/**
 * Business logic for comments. Knows nothing about HTTP or the Lambda event.
 */
import { getCommentsByPostId } from '../db/comments.mjs';
import { getPost } from './posts.mjs';

/**
 * Lists the comments of one post, oldest first.
 * @param {string} postId
 * @returns {Promise<object[]>} the comments, or [] if the post has none
 * @throws 404 if there is no post with that id
 */
export const listComments = async (postId) => {
  await getPost(postId);
  const comments = await getCommentsByPostId(postId);
  return comments.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};
