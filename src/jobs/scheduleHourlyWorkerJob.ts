import { prisma } from '../prismaClient';
import { schedulerQueue } from '../queues/schedulerQueue';
import { eventQueue } from '../queues/eventQueue';
import { EventType } from '../types/EventType';
import { format } from 'date-fns';

schedulerQueue.process(async () => {
  console.log('[Scheduler] Checking for upcoming birthday messages to schedule...');
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const upcomingMessages = await prisma.scheduledMessage.findMany({
    where: {
      status: 'PENDING',
      scheduledTime: {
        gte: now,
        lte: oneHourLater,
      },
    },
    include: { user: true },
  });

  for (const msg of upcomingMessages) {
    const delay = msg.scheduledTime.getTime() - Date.now();
    if (delay <= 0) continue;

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
        jobId: `birthday-${msg.id}`,
      }
    );

    console.log(`[Scheduler] Enqueued upcoming birthday job for ${msg.user.firstName} at ${msg.scheduledTime}`);
  }
});
