import Link from "next/link";

export default function ButtonsPage() {
  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Buttons Demo</h1>

        <div className="overflow-x-auto">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
          >
            <div
              className="animate-fade-in"
              data-cy="selectYourchoiceButton-0"
            >
              <div className="p-2">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    <span className="text-lg">
                      <span>11.74</span>
                      €<span className="text-sm">/kg</span>
                    </span>
                  </div>
                  <span className="text-gray-400 mx-1">/</span>
                  <div className="font-semibold">
                    <span className="text-lg">
                      <span>140.84</span>
                      €
                    </span>
                  </div>
                </div>
              </div>
              <span className="block text-center mt-2">Select</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
