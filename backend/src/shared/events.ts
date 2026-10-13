export interface DomainEvent {
  readonly name: string;
  readonly occurredAt: string;
}

type Listener = (event: DomainEvent) => void | Promise<void>;

/**
 * Minimal in-process domain-event dispatcher.
 * ponytail: events are not durable — a crash after commit loses them. Upgrade path: transactional outbox table + worker.
 */
export class EventDispatcher {
  private readonly listeners = new Map<string, Listener[]>();

  subscribe(eventName: string, listener: Listener): void {
    this.listeners.set(eventName, [...(this.listeners.get(eventName) ?? []), listener]);
  }

  /** Call only after the transaction commits; listener failures are logged, never propagated to the request. */
  async publish(event: DomainEvent): Promise<void> {
    for (const listener of [...(this.listeners.get(event.name) ?? []), ...(this.listeners.get('*') ?? [])]) {
      try {
        await listener(event);
      } catch (error) {
        console.error(`[events] listener for ${event.name} failed`, error);
      }
    }
  }
}

export const eventDispatcher = new EventDispatcher();
