export function OperationsLoading() {
  return (
    <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading operations">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-1/2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["ID", "Operation", "Responsible", "Status", "Created", "Updated", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-20 bg-gray-200 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-8 w-20 bg-gray-200 rounded mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}