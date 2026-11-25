/**
 * Middy middleware that only lets the owner of a post continue.
 */
import { createError } from '@middy/util';
import { getPost } from '../services/posts.mjs';

/**
 * Loads the post in the path and checks that the logged-in user owns it.
 * Must run after authenticate(), because it needs event.user.
 * Sets event.post for the owner; otherwise stops the request with 404 or 403.
 */
export const authorizePostOwner = () => ({
  before: async (request) => {
    const { event } = request;
    const post = await getPost(event.pathParameters.postId);

    // Someone may register a name that a guest was given, so the username alone does not prove ownership.
    if (post.username !== event.user.username || post.isGuest !== false) {
      throw createError(403, 'You can only change your own posts');
    }

    event.post = post;
  },
});
