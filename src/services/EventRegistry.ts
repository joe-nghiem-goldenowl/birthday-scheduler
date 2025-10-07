import { EventHandler } from '../events/EventHandler';
import { BirthdayHandler } from '../events/birthdayHandler';
import { EventType } from '../types/EventType';

export class EventRegistry {
  private static instance: EventRegistry;
  private handlers: Map<EventType, EventHandler>;

  private constructor() {
    this.handlers = new Map();
    this.handlers.set('birthday', new BirthdayHandler());
  }

  public static getInstance(): EventRegistry {
    if (!EventRegistry.instance) {
      EventRegistry.instance = new EventRegistry();
    }
    return EventRegistry.instance;
  }

  public getHandler(eventType: EventType): EventHandler {
    const handler = this.handlers.get(eventType);
    if (!handler) {
      throw new Error(`Unsupported event type: ${eventType}`);
    }
    return handler;
  }
}
