/**
 * Middy middleware that turns every error into a JSON response: { "error": "..." }.
 */
import { sendResponse } from '../utils/responses.mjs';

/**
 * Catches errors thrown by middlewares or the handler and answers with a consistent body.
 * 415/422 from the JSON body parser become 400, other 4xx keep their status and message,
 * everything else is logged and becomes 500.
 */
export const errorHandler = () => ({
  onError: async (request) => {
    const { error } = request;
    const statusCode = error?.statusCode;

    if (statusCode === 415 || statusCode === 422) {
      request.response = sendResponse(400, { error: 'Request body must be a valid JSON object' });
      return;
    }

    if (statusCode >= 400 && statusCode < 500) {
      request.response = sendResponse(statusCode, { error: error.message });
      return;
    }

    console.error(error);
    request.response = sendResponse(500, { error: 'Internal server error' });
  },
});
