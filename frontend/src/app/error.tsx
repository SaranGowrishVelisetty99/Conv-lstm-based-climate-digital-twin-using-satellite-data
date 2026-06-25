'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-red-400">Something went wrong!</h2>
        <p className="text-slate-400 text-sm">{error.message}</p>
        <button
          onClick={() => unstable_retry()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
