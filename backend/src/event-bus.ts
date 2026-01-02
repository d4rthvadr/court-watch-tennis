import EventEmitter from "node:events";
import { EventTypes } from "./types";

class EventBus extends EventEmitter {
  constructor() {
    super();

    this.on(EventTypes.playerCreated, (payload) => {
      console.log("Business logic handling playerCreated event:", payload);
      // Add additional business logic here
    });
  }
  createEvent<T = unknown>(eventType: EventTypes, payload: T): void {
    console.log(`Event created: ${eventType}`, payload);
    this.emit(eventType, payload);
  }

  registerListener(type: EventTypes, callback: (...args: any[]) => void): void {
    console.log(`Listener registered for event type: ${type}`);
    this.on(type, callback);
  }
}

export const eventBus = new EventBus();

export default EventBus;
