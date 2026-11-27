/**
 * Builds every HTTP response the API sends, so all of them share one shape.
 */

/**
 * Creates a Lambda response for API Gateway (HTTP API).
 * @param {number} statusCode HTTP status, e.g. 200, 201, 204, 404
 * @param {unknown} [data] JSON-serialisable data; leave out for a response without body
 * @returns {{ statusCode: number, headers?: object, body?: string }}
 */
export const sendResponse = (statusCode, data) => {
  if (data === undefined) {
    return { statusCode };
  }

  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};
