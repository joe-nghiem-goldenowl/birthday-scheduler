import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { prisma } from '../prismaClient';
import { eventQueue } from '../queues/eventQueue';
import { User } from '@prisma/client';
import { calculateNextBirthdayAt9AM } from '../utils/dateUtils';

export async function scheduleBirthdayJob(user: User) {
  const birthdayStr = format(user.birthday, 'yyyy-MM-dd');
  const nextBirthday = calculateNextBirthdayAt9AM(birthdayStr, user.location);

  await prisma.scheduledMessage.create({
    data: {
      userId: user.id,
      scheduledTime: nextBirthday,
    },
  });

  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  if (nextBirthday >= now && nextBirthday <= oneHourLater) {
    const delay = nextBirthday.getTime() - Date.now();
    await eventQueue.add(
      {
        userId: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        eventType: 'birthday',
        birthday: birthdayStr,
        location: user.location,
      },
      {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `birthday-${user.id}`,
      }
    );

    console.log(`[Bull] Enqueued birthday job for ${user.firstName} at ${nextBirthday.toISOString()}`);
  } else {
    console.log(`[Bull] Birthday job for ${user.firstName} scheduled in DB, will enqueue later via polling`);
  }
}


export async function rescheduleBirthdayMessage(user: User) {
  await prisma.scheduledMessage.deleteMany({
    where: {
      userId: user.id,
      status: { in: ['PENDING', 'FAILED'] },
    },
  });

  const jobId = `birthday-${user.id}`;
  const oldJob = await eventQueue.getJob(jobId);
  if (oldJob) {
    await oldJob.remove();
    console.log(`Removed old birthday job for user ${user.id}`);
  }
}
