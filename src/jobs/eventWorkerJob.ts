import { eventQueue } from '../queues/eventQueue';
import { EventRegistry } from '../services/EventRegistry';
import { prisma } from '../prismaClient';

eventQueue.process(async (job) => {
  const { fullName, userId, eventType } = job.data;
  console.log(`Processing ${eventType} job for ${fullName}`);

  const registry = EventRegistry.getInstance();
  const handler = registry.getHandler(eventType);

  await handler.handle({ fullName });

  await prisma.scheduledMessage.updateMany({
    where: {
      userId,
      scheduledTime: { lte: new Date() },
      sent: false,
    },
    data: {
      sent: true,
      sentAt: new Date(),
    },
  });
});
