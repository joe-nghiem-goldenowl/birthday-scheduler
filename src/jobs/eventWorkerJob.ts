import { eventQueue } from '../queues/eventQueue';
import { EventRegistry } from '../services/EventRegistry';
import { prisma } from '../prismaClient';

eventQueue.process(async (job) => {
  const { userId, fullName, birthday, location, eventType } = job.data;
  console.log(`Processing ${eventType} job for ${fullName}`);

  const registry = EventRegistry.getInstance();
  const handler = registry.getHandler(eventType);

  await handler.handle({ userId, fullName, birthday, location });
});
