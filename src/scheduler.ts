import { prisma } from './prismaClient';
import { eventQueue } from './queues/eventQueue';
import { cleanupQueue } from './queues/cleanupQueue';
import { schedulerQueue } from './queues/schedulerQueue';
import { EventType } from './types/EventType';
import { format } from 'date-fns';

export async function recoverScheduledJobs() {
  try {
    const unsent = await prisma.scheduledMessage.findMany({
      where: {
        status: 'PENDING',
        scheduledTime: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    for (const msg of unsent) {
      const delay = msg.scheduledTime.getTime() - Date.now();
      const birthdayStr = format(msg.user.birthday, 'yyyy-MM-dd');
      await eventQueue.add(
        {
          userId: msg.userId,
          fullName: `${msg.user.firstName} ${msg.user.lastName}`,
          eventType: msg.event_type as EventType,
          birthday: birthdayStr,
          location: msg.user.location,
        },
        {
          delay,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: false,
          jobId: `birthday-${msg.user.id}`,
        }
      );
    }

    console.log(`Recovered ${unsent.length} scheduled jobs from DB`);
  } catch (err) {
    console.error('Failed to recover scheduled jobs:', err);
  }
}

export function scheduleCleanupJob() {
  cleanupQueue.add(
    'weekly-cleanup',
    undefined,
    {
      repeat: { cron: '0 0 * * 0' },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: 'weekly-cleanup',
    }
  );

  console.log('Scheduled weekly cleanup job with Bull');
}

export function scheduleHourlySchedulerJob() {
  schedulerQueue.add(
    undefined,
    {
      repeat: { cron: '0 * * * *' },
      jobId: 'scheduler-job',
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}
