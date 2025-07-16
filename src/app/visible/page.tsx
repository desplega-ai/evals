import Link from "next/link";

export default function VisiblePage() {
  return (
    <div className="font-sans min-h-screen p-8 bg-gray-50">
      <main className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Visibility Demo</h1>

        {/* Test 1: Basic Overlapping */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Test 1: Basic Overlapping</h2>
          <div className="relative h-64 bg-gray-200 rounded">
            <a href="#" className="text-white">
              <div
                id="btn-behind"
                className="absolute top-8 left-8 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Button Behind
              </div>
            </a>
            <div className="absolute top-4 left-4 w-32 h-32 bg-red-500 opacity-90 flex items-center justify-center text-white">
              Overlapping Div
            </div>
          </div>
        </section>

        {/* Test 2: Partial Visibility */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Test 2: Partial Visibility</h2>
          <div className="relative h-64 bg-gray-200 rounded overflow-hidden">
            <button
              id="btn-partial-1"
              className="absolute top-8 right-[-120px] px-8 py-2 bg-green-500 text-white rounded"
            >
              Partially Hidden Right
            </button>
            <a
              href="#"
              id="link-partial"
              className="absolute bottom-[1px] left-8 text-blue-600 underline bg-white px-4 py-2"
            >
              Partially Hidden Bottom Link
            </a>
            <div className="absolute top-20 left-20 w-40 h-40 bg-purple-500 opacity-80">
              <p className="text-white p-2">Text inside div</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
