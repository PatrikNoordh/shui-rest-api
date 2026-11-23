/**
 * Validation schema for comments.
 */
import { z } from 'zod';

/**
 * Body of POST /posts/{postId}/comments.
 */
export const commentSchema = z.object(
  {
    content: z
      .string({ error: 'Content is required' })
      .trim()
      .min(1, 'Content is required')
      .max(500, 'Comment must be at most 500 characters'),
  },
  { error: 'Request body must be a valid JSON object' },
);
