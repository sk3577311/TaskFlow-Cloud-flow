export default function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-white/5 via-white/3 to-white/5 rounded-xl p-6 ${className}`}>
      <div className="h-4 bg-slate-300/20 rounded w-1/3 mb-3" />
      <div className="h-8 bg-slate-300/20 rounded w-2/3" />
    </div>
  );
}
