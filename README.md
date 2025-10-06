
#  Birthday Message Scheduler

A simple Node.js + TypeScript + Prisma project that automatically sends birthday messages to users at 9:00 AM based on their birthday and location.

##  General Information

- Node version: `Node v24.9.0`
- Typescript version: `Typescript 5.9.3`
- Database: `postgresql`
- Framework: `Express.js 5.1.0`
- Database ORM: `Prisma 6.16.3`

##  Installation

### Clone repository

```
git clone git@github.com:joe-nghiem-goldenowl/birthday-scheduler.git
cd birthday-scheduler
```

### Install dependencies
You need to install `Yarn` before running this command.
```
yarn install
```

### Setup environment variables

Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/birthday_scheduler"
WEBHOOK_URL="https://your-webhook-url.com"
```
### Setup Prisma

```
yarn prisma generate
yarn prisma db push
```

### Start the server

```
yarn dev
```

## Sample Request

### Create User

```
POST /users
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "birthday": "1995-10-05",
  "location": "Asia/Ho_Chi_Minh"
}
```

### Update User

```
PUT /users/:id
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "birthday": "1995-10-05",
  "location": "Asia/Ho_Chi_Minh"
}
```

### Delete User

```
DELETE /users/:id
```

### Future Improvements

The current system can handle a small number of users, but as the user base grows, we need to make the following improvements to make the system more scalable and reliable:

- Use `AWS Lambda` + `EventBridge` instead of cron jobs in the code. This makes the system easier to scale and helps prevent overload as the number of users grows.

- Use the `SQS` message queue to handle sending messages to webhooks instead of sending them directly. This prevents overload in cases so many users have the birthday on the same day. SQS service also provides built-in retry and DLQ (dead letter queue) mechanisms if webhook delivery fails.
