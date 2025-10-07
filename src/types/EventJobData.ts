import { EventType } from './EventType';

export interface EventJobData {
  userId: number;
  fullName: string;
  eventType: EventType;
}
