import { useId } from "react";

/** Kingdom crown app mark. */
export function Logo({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2=".3" y2="1">
          <stop offset="0" stopColor="#ff8a4a" />
          <stop offset=".55" stopColor="#f7662a" />
          <stop offset="1" stopColor="#e8480c" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="#f4621d" />
      <rect width="64" height="64" rx="15" fill={`url(#${id})`} />
      <path
        d="M12.5 27.1 23.9 30.7 31.9 17.9 39.9 30.7 49.7 27.1 46.5 44.8H17.7Z"
        fill="#fff"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
