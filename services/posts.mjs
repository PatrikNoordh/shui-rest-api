/**
 * Business logic for posts. Knows nothing about HTTP or the Lambda event.
 */
import { createPost, getAllPosts, getPostsByUsername } from '../db/posts.mjs';

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
