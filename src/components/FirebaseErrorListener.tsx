'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';

// This is a client component that will listen for the custom event.
// It doesn't render anything to the DOM itself.
export default function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: any) => {
      // The Next.js dev overlay will automatically pick up uncaught errors.
      // By re-throwing the error here, we leverage that feature.
      // This makes the developer experience much better.
      throw error;
    };

    errorEmitter.on('permission-error', handleError);

    // Clean up the listener when the component unmounts
    return () => {
      errorEmitter.removeListener('permission-error', handleError);
    };
  }, []);

  return null; // This component does not render anything.
}
