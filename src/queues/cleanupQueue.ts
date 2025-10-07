import { BaseEventQueue } from './BaseEventQueue';

export const cleanupQueue = new BaseEventQueue<void>('cleanupQueue');
