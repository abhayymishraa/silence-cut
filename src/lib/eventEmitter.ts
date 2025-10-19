// Simple in-memory event emitter for SSE
type EventCallback = (data: any) => void;

class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in event callback:", error);
        }
      });
    }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  getAllListeners(): Map<string, number> {
    const counts = new Map<string, number>();
    this.listeners.forEach((callbacks, event) => {
      counts.set(event, callbacks.size);
    });
    return counts;
  }
}

// Global event emitter instance
export const globalEventEmitter = new EventEmitter();
