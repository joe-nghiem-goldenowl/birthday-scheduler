import { EventJobData } from '../types/EventJobData';
import { BaseEventQueue } from './BaseEventQueue';

export const eventQueue = new BaseEventQueue<EventJobData>('eventQueue', {
  defaultJobOptions: { attempts: 3 },
});
