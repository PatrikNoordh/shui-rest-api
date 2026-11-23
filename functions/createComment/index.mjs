/**
 * Placeholder handler for a route that is not implemented.
 * Answers 501 so the route can be deployed and called.
 */

/**
 * @returns 501 with { "error": "Not implemented" }
 */
export const handler = async () => ({
  statusCode: 501,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ error: 'Not implemented' }),
});
