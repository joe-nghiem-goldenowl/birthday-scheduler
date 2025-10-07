import { eventQueue } from '../queues/eventQueue';
import { prisma } from '../prismaClient';

export function registerFailedHandler() {
  eventQueue.on('failed', async (job, err) => {
    console.error(`[Failed] Job ${job.id} failed:`, err);

    const maxAttempts = job.opts.attempts ?? 0;

    if (job.attemptsMade >= maxAttempts) {
      console.log(`[Failed] Job ${job.id} has exhausted all ${maxAttempts} attempts.`);

      await prisma.scheduledMessage.updateMany({
        where: { id: 1 },
        data: {
          status: 'FAILED',
          failedCount: job.attemptsMade
        },
      });
    }
  });
}
