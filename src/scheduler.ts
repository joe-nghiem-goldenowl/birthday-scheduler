import { prisma } from './prismaClient';
import { eventQueue } from './queues/eventQueue';
import { cleanupQueue } from './queues/cleanupQueue';

export async function recoverScheduledJobs() {
  try {
    const unsent = await prisma.scheduledMessage.findMany({
      where: {
        sent: false,
        scheduledTime: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    for (const msg of unsent) {
      const delay = msg.scheduledTime.getTime() - Date.now();
      await eventQueue.add(
        {
          userId: msg.userId,
          fullName: `${msg.user.firstName} ${msg.user.lastName}`,
          eventType: 'birthday',
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
