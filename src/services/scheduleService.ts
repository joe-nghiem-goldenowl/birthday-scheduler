import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { prisma } from '../prismaClient';
import { eventQueue } from '../queues/eventQueue';
import { User } from '@prisma/client';

function calculateNextBirthdayAt9AM(birthday: string, timezone: string): Date {
  const now = new Date();
  const [year, month, day] = birthday.split('-').map(Number);
  const currentYear = now.getUTCFullYear();

  const birthdayThisYearLocal = new Date(
    currentYear,
    month! - 1,
    day,
    9, 0, 0
  );

  let birthdayThisYearUTC = toZonedTime(birthdayThisYearLocal, timezone);

  if (birthdayThisYearUTC < now) {
    const birthdayNextYearLocal = new Date(
      currentYear + 1,
      month! - 1,
      day,
      9, 0, 0
    );
    birthdayThisYearUTC = toZonedTime(birthdayNextYearLocal, timezone);
  }

  return birthdayThisYearUTC;
}

export async function scheduleBirthdayJob(user: User) {
  const birthdayStr = format(user.birthday, 'yyyy-MM-dd');
  const nextBirthday = calculateNextBirthdayAt9AM(birthdayStr, user.location);

  await prisma.scheduledMessage.create({
    data: {
      userId: user.id,
      scheduledTime: nextBirthday,
    },
  });

  const delay = nextBirthday.getTime() - Date.now();
  await eventQueue.add(
    {
      userId: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      eventType: 'birthday',
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

  console.log(`[Bull] Scheduled birthday job for ${user.firstName} at ${nextBirthday.toISOString()}`);
}


export async function rescheduleBirthdayMessage(user: User) {
  await prisma.scheduledMessage.deleteMany({
    where: {
      userId: user.id,
      sent: false,
    },
  });

  const birthdayStr = format(user.birthday, 'yyyy-MM-dd');
  const [year, month, day] = birthdayStr.split('-').map(Number);
  const currentYear = new Date().getFullYear();

  const birthdayThisYearLocal = new Date(currentYear, month! - 1, day, 9, 0, 0);

  const birthdayUTC = toZonedTime(birthdayThisYearLocal, user.location);

  await prisma.scheduledMessage.create({
    data: {
      userId: user.id,
      scheduledTime: birthdayUTC
    },
  });

}
