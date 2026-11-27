/**
 * Validation schemas for posts: the body of create/update and the query of GET /posts.
 */
import { z } from 'zod';

/**
 * Body of POST /posts and PUT /posts/{postId}.
 */
export const postSchema = z.object(
  {
    title: z
      .string({ error: 'Title is required' })
      .trim()
      .min(1, 'Title is required')
      .max(100, 'Title must be at most 100 characters'),
    content: z
      .string({ error: 'Content is required' })
      .trim()
      .min(1, 'Content is required')
      .max(1000, 'Content must be at most 1000 characters'),
  },
  { error: 'Request body must be a valid JSON object' },
);

/**
 * Query of GET /posts — only ?username= is allowed.
 */
export const postsQuerySchema = z.strictObject(
  {
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'Invalid query parameters')
      .max(20, 'Invalid query parameters')
      .optional(),
  },
  { error: 'Invalid query parameters' },
);
