import { BaseEventQueue } from './BaseEventQueue';

export const schedulerQueue = new BaseEventQueue<void>('schedulerQueue', {
  defaultJobOptions: { attempts: 3 },
});
