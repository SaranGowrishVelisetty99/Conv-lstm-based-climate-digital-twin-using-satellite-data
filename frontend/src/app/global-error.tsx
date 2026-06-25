'use client';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <html>
      <body className="bg-slate-950 text-white flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Something went wrong!</h2>
          <p className="text-slate-400 text-sm">{error.message}</p>
          <button
            onClick={() => unstable_retry()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
