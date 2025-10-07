import { cleanupQueue } from '../queues/cleanupQueue';
import { prisma } from '../prismaClient';

cleanupQueue.process(async () => {
  console.log('[Cleanup Job] Starting cleanup of old sent messages');

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const deleted = await prisma.scheduledMessage.deleteMany({
    where: {
      sent: true,
      scheduledTime: {
        lt: cutoff,
      },
    },
  });

  console.log(`[Cleanup Job] Deleted ${deleted.count} old sent messages`);
});
