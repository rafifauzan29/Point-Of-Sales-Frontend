export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="px-6 py-8 space-y-6">

        <div className="h-8 w-40 bg-gray-200 rounded-md" />

        <div className="bg-gray-100 rounded-2xl p-6 h-28" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>

        <div className="bg-gray-100 rounded-2xl p-5">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="h-[260px] bg-gray-200 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>

        <div className="bg-gray-100 rounded-2xl p-4 space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded mb-2" />

          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}