// app/loading.js
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Elegant Ring */}
        <div className="w-20 h-20 rounded-full border-2 border-stone-200 border-t-emerald-700 animate-spin" />

        {/* Inner Pulsing Icon (Hanger / Modest Fashion Vibe) */}
        <div className="absolute animate-pulse text-emerald-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Elegant Hanger Icon */}
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7l7 5.25a1 1 0 0 1 .4 1.05l-1.5 6A1 1 0 0 1 17.9 20H6.1a1 1 0 0 1-.98-.7l-1.5-6a1 1 0 0 1 .4-1.05L11 7V5.72A2.001 2.001 0 0 1 12 2z" />
          </svg>
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <p className="text-sm font-medium tracking-widest text-stone-700 uppercase">
          Loading Collection
        </p>
        <span className="text-xs text-stone-400 font-serif italic">
          Please wait a moment...
        </span>
      </div>
    </div>
  );
}