export default function ProfileSkeleton() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="animate-pulse space-y-6">

        <div className="h-6 w-40 bg-gray-200 rounded-md" />

        <div className="bg-gray-100 rounded-xl p-6 flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl p-6 space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded-lg" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-32 bg-gray-200 rounded" />
            <div className="flex gap-6">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="pt-4">
            <div className="h-10 w-40 bg-gray-200 rounded-lg" />
          </div>

        </div>
      </div>
    </div>
  );
}