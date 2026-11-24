/**
 * Business logic for posts. Knows nothing about HTTP or the Lambda event.
 */
import { createPost } from '../db/posts.mjs';

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
