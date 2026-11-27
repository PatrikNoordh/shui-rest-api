/**
 * Validation schema for register and login.
 */
import { z } from 'zod';

const usernameLength = 'Username must be 3-20 characters';
const passwordLength = 'Password must be 8-72 characters';

/**
 * Body of POST /auth/register and POST /auth/login.
 */
export const credentialsSchema = z.object(
  {
    username: z
      .string({ error: 'Username is required' })
      .trim()
      .toLowerCase()
      .min(3, usernameLength)
      .max(20, usernameLength)
      .regex(/^[a-z0-9_]+$/, 'Username may only contain letters, numbers and _'),
    password: z
      .string({ error: 'Password is required' })
      .min(8, passwordLength)
      .max(72, passwordLength)
      .refine((password) => Buffer.byteLength(password, 'utf8') <= 72, passwordLength),
  },
  { error: 'Request body must be a valid JSON object' },
);
