# Shui

Shui is a REST API for a digital message board. Users register, log in and post messages, edit and delete their own posts, and comment on posts. Guests can post without an account. The API runs on AWS Lambda behind Amazon API Gateway and stores its data in Amazon DynamoDB.

## Live API

```
https://yh9bft53dl.execute-api.eu-north-1.amazonaws.com
```

Try it: [`GET /posts`](https://yh9bft53dl.execute-api.eu-north-1.amazonaws.com/posts)

## Tech stack

- **Node.js 24** with ES modules (`.mjs`)
- **AWS Lambda**, one function per endpoint
- **Amazon API Gateway** (HTTP API)
- **Amazon DynamoDB**, three tables: users, posts and comments
- **Serverless Framework v4** for deploying
- **Middy** for middleware (authentication, authorization, validation, errors)
- **Zod** for input validation
- **bcryptjs** for password hashing
- **jsonwebtoken** for JWT authentication

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 24
- The Serverless Framework CLI v4: `npm install -g serverless`
- An AWS account, with credentials configured on your machine
- A Serverless account (the CLI asks you to sign in the first time)
- An IAM role that Lambda can use, with CloudWatch Logs and DynamoDB access

### Install

```bash
git clone https://github.com/PatrikNoordh/shui-rest-api.git
cd shui-rest-api
npm install
```

### Configure

Copy the template and fill in your own values:

```bash
cp config.example.yml config.yml
```

| Key         | Value                                                            |
| ----------- | ---------------------------------------------------------------- |
| `org`       | Your Serverless organization                                     |
| `jwtSecret` | A long random string, for example from `openssl rand -base64 48` |
| `role`      | The ARN of the IAM role the Lambda functions run as              |

The role must trust `lambda.amazonaws.com` and allow CloudWatch Logs and DynamoDB, for example with the AWS managed policies `AWSLambdaBasicExecutionRole` and `AmazonDynamoDBFullAccess_v2`.

`config.yml` is in `.gitignore` and must never be committed. Changing `jwtSecret` makes every issued token invalid.

### Deploy

```bash
serverless deploy
```

The deploy creates the functions, the routes and the three DynamoDB tables in `eu-north-1`, stage `dev`. To see the API URL again:

```bash
serverless info
```

To read the logs of one function, for example after a `500`:

```bash
serverless logs -f createPost
```

## Endpoints

| Method   | Path                       | Access             | Success |
| -------- | -------------------------- | ------------------ | ------- |
| `POST`   | `/auth/register`           | Public             | `201`   |
| `POST`   | `/auth/login`              | Public             | `200`   |
| `GET`    | `/posts`                   | Public             | `200`   |
| `GET`    | `/posts?username=jesper`   | Public             | `200`   |
| `GET`    | `/posts/{postId}`          | Public             | `200`   |
| `POST`   | `/posts`                   | Logged in or guest | `201`   |
| `PUT`    | `/posts/{postId}`          | Owner              | `200`   |
| `DELETE` | `/posts/{postId}`          | Owner              | `204`   |
| `GET`    | `/posts/{postId}/comments` | Public             | `200`   |
| `POST`   | `/posts/{postId}/comments` | Logged in          | `201`   |

- Lists are plain JSON arrays. When nothing is found, the answer is `200` with `[]`.
- Posts are returned newest first, and comments oldest first.
- Dates are ISO 8601.
- `id`, `username`, `isGuest`, `createdAt` and `updatedAt` are always set by the server. Values for them in a request body are ignored.
- Deleting a post also deletes its comments.

## Authentication

1. Register with `POST /auth/register`.
2. Log in with `POST /auth/login`. The answer contains a token.
3. Send the token with every protected request:

```
Authorization: Bearer <token>
```

- The token is a JWT signed with HS256 and is valid for **1 hour**. After that, log in again.
- The user's identity always comes from the verified token, never from the request body.
- Usernames are 3–20 characters (letters, numbers and `_`), are stored in lower case, are unique and can never change.
- Passwords are 8–72 characters, are stored only as a bcrypt hash and are never returned.
- Only the owner of a post can update or delete it. Another user gets `403`.

## Guest posts

`POST /posts` **without** an `Authorization` header creates a guest post. The server gives it a random username such as `unicorn123` and sets `isGuest: true`.

- A header that is present but invalid or expired answers `401`. It never creates a guest post.
- Guest posts can never be updated or deleted, also not by a registered user with the same username. Ownership requires `isGuest: false`.
- Guest posts show up in `GET /posts` and `GET /posts?username=<guest name>`.
- Guests cannot comment. `POST /posts/{postId}/comments` always needs a token, but guest posts can be commented on by logged-in users.

## Example requests

### Register

`POST /auth/register`

```json
{
  "username": "jesper",
  "password": "Password123!"
}
```

`201 Created`

```json
{
  "message": "User registered successfully",
  "username": "jesper"
}
```

### Log in

`POST /auth/login`

```json
{
  "username": "jesper",
  "password": "Password123!"
}
```

`200 OK`

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "jesper"
}
```

### Create a post

`POST /posts` with `Authorization: Bearer <token>`

```json
{
  "title": "Mitt första inlägg",
  "content": "Hej på er allihop!"
}
```

`201 Created`

```json
{
  "message": "Post created successfully",
  "post": {
    "id": "post-123",
    "username": "jesper",
    "isGuest": false,
    "title": "Mitt första inlägg",
    "content": "Hej på er allihop!",
    "createdAt": "2026-11-20T10:00:00Z",
    "updatedAt": "2026-11-20T10:00:00Z"
  }
}
```

Without the header, the same request creates a guest post:

```json
{
  "message": "Post created successfully",
  "post": {
    "id": "post-456",
    "username": "unicorn123",
    "isGuest": true,
    "title": "Ett gästinlägg",
    "content": "Hej från en gäst!",
    "createdAt": "2026-11-20T11:00:00Z",
    "updatedAt": "2026-11-20T11:00:00Z"
  }
}
```

### Update a post

`PUT /posts/{postId}` with the owner's token. Only `title` and `content` can change, and `updatedAt` is set automatically.

```json
{
  "title": "Uppdaterad rubrik",
  "content": "Detta är mitt uppdaterade inlägg."
}
```

`200 OK`

```json
{
  "message": "Post updated successfully",
  "post": {
    "id": "post-123",
    "username": "jesper",
    "isGuest": false,
    "title": "Uppdaterad rubrik",
    "content": "Detta är mitt uppdaterade inlägg.",
    "createdAt": "2026-11-20T10:00:00Z",
    "updatedAt": "2026-11-20T12:00:00Z"
  }
}
```

### Delete a post

`DELETE /posts/{postId}` with the owner's token answers `204 No Content` without a body.

### Comment on a post

`POST /posts/{postId}/comments` with `Authorization: Bearer <token>`

```json
{
  "content": "Vilket bra inlägg!"
}
```

`201 Created`

```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": "comment-123",
    "postId": "post-123",
    "username": "jonte",
    "content": "Vilket bra inlägg!",
    "createdAt": "2026-11-20T13:00:00Z"
  }
}
```

## Errors

Every error has the same format:

```json
{
  "error": "Post not found"
}
```

| Status | Meaning                                                | Example message                                                             |
| ------ | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `400`  | Bad Request: invalid JSON or invalid fields            | `Title is required`, `Request body must be a valid JSON object`             |
| `401`  | Unauthorized: missing or invalid token, or wrong login | `Missing token`, `Invalid or expired token`, `Invalid username or password` |
| `403`  | Forbidden: not the owner, or a guest post              | `You can only change your own posts`                                        |
| `404`  | Not Found: the post does not exist                     | `Post not found`                                                            |
| `409`  | Conflict: the username is taken                        | `Username is already taken`                                                 |
| `500`  | Internal Server Error                                  | `Internal server error`                                                     |

Checks run in a fixed order: token (`401`), then the body (`400`), then the post (`404`), then the owner (`403`). Internal details and stack traces are only written to the CloudWatch logs, never sent to the client.

## Project structure

```
shui-rest-api/
├── functions/     one folder per Lambda, a short Middy handler
├── middlewares/   authenticate, authorizePostOwner, validate, errorHandler
├── schemas/       Zod schemas for the request bodies and the query
├── services/      business logic, knows nothing about HTTP
├── db/            the only code that talks to DynamoDB
├── utils/         response helper, JWT helpers, guest name generator
└── serverless.yml functions, routes, tables and environment variables
```

A request flows through the layers in one direction:

```
API Gateway → middlewares → handler (functions/) → services/ → db/ → DynamoDB
```

| Table               | Partition key | Sort key | Index                                     |
| ------------------- | ------------- | -------- | ----------------------------------------- |
| `shui-users-dev`    | `username`    | —        | —                                         |
| `shui-posts-dev`    | `id`          | —        | `usernameIndex` (`username`, `createdAt`) |
| `shui-comments-dev` | `postId`      | `id`     | —                                         |

## Testing

The API is tested with `curl` against the deployed URL. Set the variables once:

```bash
export BASE_URL=https://yh9bft53dl.execute-api.eu-north-1.amazonaws.com
```

Register and log in, and save the token:

```bash
curl -s -w '\n%{http_code}\n' -X POST "$BASE_URL/auth/register" -H 'Content-Type: application/json' -d '{"username":"jesper","password":"Password123!"}'
```

```bash
export TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H 'Content-Type: application/json' -d '{"username":"jesper","password":"Password123!"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
```

Create a post, then list all posts:

```bash
curl -s -w '\n%{http_code}\n' -X POST "$BASE_URL/posts" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"title":"Hello","content":"First post"}'
```

```bash
curl -s -w '\n%{http_code}\n' "$BASE_URL/posts"
```

- `-w '\n%{http_code}\n'` prints the status code after the body.
- Request bodies need `-H 'Content-Type: application/json'`. Without it, the API answers `400 Request body must be a valid JSON object`.
- JSON in single quotes keeps the shell from changing characters such as `!`.

Before opening a pull request:

```bash
npm run format:check
```

## Git workflow

- `main` is the release branch and `dev` is the base for all work.
- Every change starts as a GitHub issue titled `[SHUI-NNN] Title`.
- Branch: `type/SHUI-NNN-short-description`, for example `feature/SHUI-009-create-post`.
- Commit: `type [SHUI-NNN] Present tense description`, for example `feat [SHUI-009] Add create post endpoint`.
- Types: `feature`/`feat`, `fix`, `refactor`, `chore`, `docs`, `test`.
- Every branch is merged into `dev` through a pull request that follows `.github/pull_request_template.md`. CI checks formatting and syntax on every pull request.
- When everything is done, `dev` is merged into `main`.
