/**
 * Business logic for posts. Knows nothing about HTTP or the Lambda event.
 */
import { createError } from '@middy/util';
import {
  createPost,
  deletePost,
  getAllPosts,
  getPostById,
  getPostsByUsername,
  updatePost,
} from '../db/posts.mjs';
import { deleteCommentsByPostId } from '../db/comments.mjs';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Creates and saves a new post.
 * @param {{ username: string, isGuest: boolean, title: string, content: string }} input
 * @returns the saved post
 */
export const addPost = async ({ username, isGuest, title, content }) => {
  const now = new Date().toISOString();

  const post = {
    id: crypto.randomUUID(),
    username,
    isGuest,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };

  await createPost(post);
  return post;
};

/**
 * Lists posts, newest first.
 * @param {string} [username] only posts by this user; leave out for all posts
 * @returns {Promise<object[]>} the posts, or [] if there are none
 */
export const listPosts = async (username) => {
  if (username) {
    return getPostsByUsername(username);
  }

  const posts = await getAllPosts();

  return posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

/**
 * Gets one post by id.
 * @param {string} postId
 * @returns the post
 * @throws 404 if there is no post with that id
 */
export const getPost = async (postId) => {
  if (!UUID_PATTERN.test(postId)) {
    throw createError(404, 'Post not found');
  }

  const post = await getPostById(postId);

  if (!post) {
    throw createError(404, 'Post not found');
  }

  return post;
};

/**
 * Changes the title and content of a post and sets updatedAt to now.
 * @param {string} postId
 * @param {{ title: string, content: string }} changes
 * @returns the whole post after the update
 */
export const editPost = async (postId, { title, content }) => {
  return updatePost(postId, {
    title,
    content,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Deletes a post and all its comments.
 * The comments go first, so a failure leaves the post in place and the delete can be retried.
 * @param {string} postId
 */
export const removePost = async (postId) => {
  await deleteCommentsByPostId(postId);
  await deletePost(postId);
};
