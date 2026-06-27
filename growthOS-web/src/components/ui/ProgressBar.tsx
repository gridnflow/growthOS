export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-[width] duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
