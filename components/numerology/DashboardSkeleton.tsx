export default function DashboardSkeleton() {
  return (
    <div className="rounded-card border border-white/10 p-5 w-full max-w-6xl mx-auto">
      <div className="om-skel h-4 w-32 rounded mb-4" />
      <div className="grid grid-cols-3 gap-1 mb-4" style={{ width: 168 }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="om-skel rounded" style={{ width: 52, height: 52 }} />
        ))}
      </div>
      <div className="om-skel h-3 w-4/5 rounded mb-2" />
      <div className="om-skel h-3 w-3/5 rounded" />
    </div>
  );
}
