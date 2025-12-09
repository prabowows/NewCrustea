import { EventEmitter } from 'events';
import { FirestorePermissionError } from './errors';

// Extend EventEmitter typing for our specific event
interface TypedEventEmitter extends EventEmitter {
  emit(event: 'permission-error', error: FirestorePermissionError): boolean;
  on(event: 'permission-error', listener: (error: FirestorePermissionError) => void): this;
}

// Export a singleton instance of the event emitter
export const errorEmitter = new EventEmitter() as TypedEventEmitter;
