/**
 * Middy middleware that validates part of the event with a Zod schema.
 */
import { createError } from '@middy/util';

/**
 * Checks event[source] against a Zod schema before the handler runs.
 * On success event[source] is replaced with the parsed data (trimmed, unknown body fields removed);
 * on failure the request stops with 400 and the first issue message.
 * @param {import('zod').ZodType} schema
 * @param {'body' | 'queryStringParameters'} [source='body']
 */
export const validate = (schema, source = 'body') => ({
  before: async (request) => {
    const result = schema.safeParse(request.event[source] ?? {});

    if (!result.success) {
      throw createError(400, result.error.issues[0].message);
    }
    request.event[source] = result.data;
  },
});
