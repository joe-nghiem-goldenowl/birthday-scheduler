import { QueueOptions } from 'bull';
import Queue from 'bull'
import { EventJobData } from '../types/EventJobData';

export class BaseEventQueue<T = EventJobData> extends Queue<T> {
  constructor(queueName: string, options?: QueueOptions) {
    super(queueName, {
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
      ...options,
    });
  }
}
