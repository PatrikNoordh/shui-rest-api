/**
 * Validation schema for register and login.
 */
import { z } from 'zod';

const usernameLenght = 'Username must be 3-20 characters';
const passwordLenght = 'Password must be 8-72 characters';

/**
 * Body of POST /auth/register and POST /auth/login.
 */
export const credentialsSchema = z.object(
  {
    username: z
      .string({ error: 'Username is required' })
      .trim()
      .toLowerCase()
      .min(3, usernameLenght)
      .max(20, usernameLenght)
      .regex(/^[a-z0-9_]+$/, 'Username may only contain letters, numbers and _'),
    password: z
      .string({ error: 'Password is required' })
      .min(8, passwordLenght)
      .max(72, passwordLenght),
  },
  { error: 'Request body must be a valid JSON object' },
);
