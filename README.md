
#  Birthday Message Scheduler

A simple Node.js + TypeScript + Prisma project that automatically sends birthday messages to users at 9:00 AM based on their birthday and location.

##  General Information

- Node version: `Node v24.9.0`
- Typescript version: `Typescript 5.9.3`
- Database: `postgresql`
- Framework: `Express.js 5.1.0`
- Database ORM: `Prisma 6.16.3`
- Redis: `Redis`

## Solution

We use the `Bull` library to create jobs that send messages at exactly 9 AM. These jobs are stored in Redis, which ensures that the system can scale to multiple instances in the future.

When a user is created, the time to send the message is calculated and a job is created. When a user is deleted or updated, the corresponding job is adjusted accordingly. We also store the jobs that need to be sent in the database. This ensures that if the system goes down, we do not lose any jobs that need to be sent. When the system comes back online, we query the database to retrieve unsent jobs and send them.

We will have a job that runs monthly to delete old jobs from the database. This ensures that the database does not grow too large over time.

The code architecture is designed using the Register design pattern. This ensures that we can extend to many other event types beyond birthdays without having to change the code significantly.

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
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
RATE_LIMIT_MAX=100
PORT=3000
```
### Setup Prisma

```
yarn prisma generate
yarn prisma db push
```

### Install and run redis

```
redis-server
```

### Start the server

```
yarn dev
```

### Access job dashboard

```
http://localhost:3000/admin/queues
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
