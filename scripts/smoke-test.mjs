/**
 * Smoke test: runs the main flow of the API against a deployed URL.
 * Usage: BASE_URL=https://xxxx.execute-api.eu-north-1.amazonaws.com npm run smoke
 */

const BASE_URL = process.env.BASE_URL?.replace(/\/+$/, '');

if (!BASE_URL) {
  console.error('Usage: BASE_URL=<API URL> npm run smoke');
  process.exit(1);
}

const PASSWORD = 'Password123!';
const suffix = Math.floor(Math.random() * 1_000_000);
const userA = `smoke_a${suffix}`;
const userB = `smoke_b${suffix}`;

let passed = 0;
let failed = 0;

/**
 * Sends one request to the API.
 * @returns {Promise<{ status: number, data: any }>} the status code and the parsed body
 */
const request = async (method, path, { body, token } = {}) => {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data = text;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    // Not JSON: keep the text so a failure can show it.
  }

  return { status: response.status, data };
};

/**
 * Prints one result line and counts it.
 * @param {string} label what the step does
 * @param {{ status: number, data: any }} res the response from request()
 * @param {number} expected the status code the step expects
 * @param {boolean} [ok=true] an extra check on the body
 */
const check = (label, res, expected, ok = true) => {
  const success = res.status === expected && ok;
  if (success) {
    passed++;
  } else {
    failed++;
  }
  console.log(`${success ? '✅' : '❌'} ${res.status} ${label}`);
  if (!success) console.log(`   expected ${expected}, got:`, res.data);
};

// ================================== Auth ==================================

let res = await request('POST', '/auth/register', {
  body: { username: userA, password: PASSWORD },
});
check('POST /auth/register', res, 201, res.data?.username === userA);

res = await request('POST', '/auth/register', { body: { username: userA, password: PASSWORD } });
check('POST /auth/register (same username)', res, 409);

res = await request('POST', '/auth/login', { body: { username: userA, password: PASSWORD } });
check('POST /auth/login', res, 200, typeof res.data?.token === 'string');
const tokenA = res.data?.token;

res = await request('POST', '/auth/login', {
  body: { username: userA, password: 'WrongPassword1!' },
});
check('POST /auth/login (wrong password)', res, 401);

res = await request('POST', '/auth/register', { body: { username: userB, password: PASSWORD } });
check('POST /auth/register (user B)', res, 201);

res = await request('POST', '/auth/login', { body: { username: userB, password: PASSWORD } });
check('POST /auth/login (user B)', res, 200, typeof res.data?.token === 'string');
const tokenB = res.data?.token;

// ================================== Posts ==================================

res = await request('POST', '/posts', {
  token: tokenA,
  body: { title: 'Smoke test', content: 'Created by the smoke test' },
});
check(
  'POST /posts',
  res,
  201,
  res.data?.post?.isGuest === false && res.data?.post?.username === userA,
);
const postId = res.data?.post?.id;

res = await request('GET', '/posts');
check('GET /posts', res, 200, Array.isArray(res.data) && res.data.some((p) => p.id === postId));

res = await request('GET', `/posts?username=${userA}`);
check('GET /posts?username=', res, 200, res.data?.length === 1 && res.data[0].id === postId);

res = await request('GET', `/posts/${postId}`);
check('GET /posts/{postId}', res, 200, res.data?.id === postId);

res = await request('PUT', `/posts/${postId}`, {
  token: tokenA,
  body: { title: 'Smoke test updated', content: 'Updated by the smoke test' },
});
check('PUT /posts/{postId}', res, 200, res.data?.post?.title === 'Smoke test updated');

res = await request('PUT', `/posts/${postId}`, {
  token: tokenB,
  body: { title: 'Not mine', content: 'Not mine' },
});
check('PUT /posts/{postId} (other user)', res, 403);

// ================================== Guests ==================================

res = await request('POST', '/posts', {
  body: { title: 'Smoke test guest', content: 'Created by the smoke test' },
});
check('POST /posts (guest)', res, 201, res.data?.post?.isGuest === true);
const guestPostId = res.data?.post?.id;

res = await request('POST', '/posts', {
  token: 'abc',
  body: { title: 'Bad token', content: 'Bad token' },
});
check('POST /posts (bad token)', res, 401);

res = await request('PUT', `/posts/${guestPostId}`, {
  token: tokenA,
  body: { title: 'Not mine', content: 'Not mine' },
});
check('PUT /posts/{postId} (guest post)', res, 403);

// ================================== Comments ==================================

res = await request('POST', `/posts/${postId}/comments`, {
  token: tokenB,
  body: { content: 'Smoke test comment' },
});
check('POST /posts/{postId}/comments', res, 201, res.data?.comment?.username === userB);

res = await request('POST', `/posts/${postId}/comments`, {
  body: { content: 'No token' },
});
check('POST /posts/{postId}/comments (no token)', res, 401);

res = await request('GET', `/posts/${postId}/comments`);
check('GET /posts/{postId}/comments', res, 200, res.data?.length === 1);

// ================================== Delete ==================================

res = await request('DELETE', `/posts/${postId}`, { token: tokenA });
check('DELETE /posts/{postId}', res, 204);

res = await request('GET', `/posts/${postId}`);
check('GET /posts/{postId} (deleted)', res, 404);

res = await request('GET', `/posts/${postId}/comments`);
check('GET /posts/{postId}/comments (deleted)', res, 404);

console.log(`\n${passed}/${passed + failed} passed`);
process.exitCode = failed > 0 ? 1 : 0;
