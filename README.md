## Table of Contents

- [Description](#description)
- [Technologies](#technologies)
- [Project Setup](#project-setup)
- [Running the Project](#running-the-project)
- [Database Configuration](#database-configuration)
- [Using this Template](#using-this-template)
- [⚠️ Branch Protection Recommendation](#️-branch-protection-recommendation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Support](#support)
- [License](#license)
- [Code Style](#code-style)
- [Endpoints](#Endpoints)
- [Codecov](#Codecov)

## Description

This repository is a template for creating microservices for the Class-Connect application. It uses **NestJS**, **Prisma**, and **TypeScript** with a **package-layered architecture**. The template is intentionally minimal and ready to be customized for each specific microservice.

## Technologies

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: A next-generation ORM for database management.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Package-Layered Architecture**: A modular architecture pattern for better scalability and maintainability.

## Project Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (default database, can be switched to MongoDB if needed)

### Installation

Clone the repository and install dependencies:

```bash
$ git clone <repository-url>
$ cd classconnect-users-service
$ npm install
```

## Running the Project

### Development Mode

```bash
$ npm run start
```

### Watch Mode

```bash
$ npm run start:dev
```

### Production Mode

```bash
$ npm run start:prod
```

## Database Configuration

By default, this template is configured to use **PostgreSQL**. You can modify the database configuration in the `prisma/schema.prisma` file to switch to **MongoDB** or another database if required.

To migrate the database schema:

```bash
$ npx prisma migrate dev
```

To generate Prisma client:

```bash
$ npx prisma generate
```

## Using this Template

You can create a new repository from this template by clicking the **"Use this template"** button on GitHub. After cloning, make sure to:

- Run `npm install` to install dependencies.
- Update the `.env.example` file and create your own `.env`.
- Initialize your own Prisma schema.
- Configure GitHub Actions if needed.

## ⚠️ Branch Protection Recommendation

After creating a new repository from this template, we recommend you:

1. Go to `Settings > Branches` in your GitHub repository.
2. Add a protection rule for the `main` branch:
   - ✅ Require status checks to pass before merging.
   - ✅ Require branches to be up to date.
   - ❌ Review requirement is optional.
   - ✅ Block direct pushes (recommended).

## Testing

This project uses **Jest** for unit testing. To run tests:

```bash
$ npm run test
```

To run tests with coverage:

```bash
$ npm run test:cov
```

Tests will automatically run on every push or pull request to `main` via GitHub Actions.

## Project Structure

```
src/
├── controllers/
├── services/
├── modules/
├── entities/
├── repositories/
├── main.ts
├── app.module.ts
prisma/
├── schema.prisma
.github/
└── workflows/
    └── ci.yml
```

## Support

This template is open source and licensed under the MIT license. Contributions and feedback are welcome.

## License

This project is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Code Style

We use **Prettier** and **ESLint** to maintain consistent code formatting and quality. Use the following commands:

- To check and fix lint issues:

```bash
$ npm run lint
```

- To format files using Prettier:

```bash
$ npm run format
```

- To check formatting without making changes:

```bash
$ npm run format:check
```
## Endpoints
- To test the API, you can use tools like Postman or send curl requests.

- To create a user using curl:

```bash
    curl --location 'http://localhost:3001/users' \
    --header 'Content-Type: application/json' \
    --data-raw '{
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@gmail.com",
    "name": "Username",
    "urlProfilePhoto": "https://firebasestorage.googleapis.com/v0/profile_picture_user.jpg",
    "provider": "google.com"
    }'
```

- To add user's location
```bash
    curl --location --request PATCH 'http://localhost:3001/users/{user_uuid}/location' \
    --header 'Content-Type: application/json' \
    --data '{
        "latitude" : 34.6037,
        "longitude" : 58.3816
        }'
```

- To update number of failed attempts when a user logs in
```bash
curl --location --request PATCH 'http://localhost:3001/users/{user_email}/failed-attempts' \
--header 'Content-Type: application/json' \
--data ''
```

- To check if a user is blocked
```bash
curl --location 'http://localhost:3001/users/{user_email}/check-lock-status' \
--header 'Content-Type: application/json' \
--data ''
```

-To get user by uuid: 
```bash
curl --location 'http://localhost:3001/users/{user_uuid}' \
--header 'Content-Type: application/json' \
--data ''
```

-To update user name, email, urlProfilePhoto and description by uuid: 
```bash
curl --location --request PATCH 'http://localhost:3001/users/{user_uuid}' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Updated Name",
  "email": "updated.user@gmail.com",
  "urlProfilePhoto": "https://firebasestorage.googleapis.com/v0/new_photo.jpg",
  "description": "Updated profile description"
}'
```

-To get all users: 
```bash
curl --location 'http://localhost:3001/users' \
--header 'Content-Type: application/json' \
--data ''
```

-To change lock status of a user by uuid.
```bash
curl --location --request PATCH 'http://localhost:3001/users/{user_uuid}/lock-status' \
--header 'Content-Type: application/json' \
--data ''
```

-To ask a question to the AI chat.
```bash
curl --location 'http://localhost:3001/users/chat' \
--header 'Content-Type: application/json' \
--data '{
    "question": "Can i log in with Google?",
    "userId":"Rnx8ZqMAYgLksT29FVdJxP0rhLk7"
    }'

```

-To submit feedback on the AI chat response.
```bash
curl --location 'http://localhost:3001/users/chat/feedback' \
--header 'Content-Type: application/json' \
--data '{
  "answer": "Yes, the system supports Google login.",
  "comment_feedback": "Thanks!",
  "rating": 5,
  "userId": "Rnx8ZqMAYgLksT29FVdJxP0rhLk7"  
}'
```

-To validate google token:
```bash
curl --location 'http://localhost:3001/users/auth/google' \
--header 'Content-Type: application/json' \
--data '{
    "idToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTY4MzIzMzAwMCwiZXhwIjoxNjgzMjM2NjAwfQ.sD9gN0gUQJkjMvHe8FAH8DqvAPqH_3v0YzDwFg2nFGBzLGzR6lUcDL2j9Lb9iY2cXuZDJ4RfsXeY5VfYgWDvsc7tw7yRcFZxV1MjAJebdSxVX3OvwzKJj57Ff4uRzUEYyEZVfL3zRwdY3CW2KnMW4C2v43VpFCdKo3M2fNcd9q8M4lU9Fg2XPab4hP2aAZuGz7RzRzMGhMGjPoST4FZ8qGpYpK1t5RzqzGvP5cGgZz9XKZj3L5YgHjM3sZtYWfHzqNVXhv3F6KpKxDZv4LrFd3YcKdY7TfAzP6HfXrMq8D2c3tX7RpTyNqTfRLmJWz4BhvK6zC2HFzJHfWP9wKvh5rT7xWJrCqT4D7mWxqZyHtL4"
    }'
```

## Codecov

[![codecov](https://codecov.io/github/IS2-Class-Connect/classconnect-users-service/graph/badge.svg?token=3VB1IC3IDR)](https://codecov.io/github/IS2-Class-Connect/classconnect-users-service)