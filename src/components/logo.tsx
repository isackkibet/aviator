export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[#8b5cf6] to-violet-700 flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none">
        <path d="M2 12l19-9-7 9 7 9-19-9z" fill="white" />
        <path d="M2 12l9 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}
