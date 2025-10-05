
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
