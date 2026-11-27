/**
 * Business logic for comments. Knows nothing about HTTP or the Lambda event.
 */
import { createComment, getCommentsByPostId } from '../db/comments.mjs';
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

/**
 * Creates and saves a comment on an existing post.
 * @param {{ postId: string, username: string, content: string }} input
 * @returns the saved comment
 * @throws 404 if there is no post with that id
 */
export const addComment = async ({ postId, username, content }) => {
  await getPost(postId);

  const comment = {
    id: crypto.randomUUID(),
    postId,
    username,
    content,
    createdAt: new Date().toISOString(),
  };

  await createComment(comment);
  return comment;
};
