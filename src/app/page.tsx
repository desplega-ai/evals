"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const viewParam = searchParams.get("view");
  const viewMode: "list" | "table" = viewParam === "table" ? "table" : "list";

  const setViewMode = (mode: "list" | "table") => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === "list") {
      params.delete("view");
    } else {
      params.set("view", mode);
    }
    const query = params.toString();
    router.push(query ? `?${query}` : "/", { scroll: false });
  };

  const routes = [
    { path: "/speedrun", name: "Speedrun Challenge", description: "Complete all challenges as fast as you can", isFeatured: true },
    { path: "/table", name: "Table Demo", description: "View dummy table data" },
    { path: "/checkboxes", name: "Checkboxes Demo", description: "Different checkbox types" },
    { path: "/visible", name: "Visibility Demo", description: "Interaction with visible and not visible elements" },
    { path: "/buttons", name: "Buttons Demo", description: "Interaction with different types of buttons" },
    { path: "/sliders", name: "Sliders Demo", description: "Range sliders with different types and variants" },
    { path: "/files", name: "Files Demo", description: "Upload and download files" },
    { path: "/dialogs", name: "Dialogs Demo", description: "Browser native dialogs (alert, confirm, prompt)" },
    { path: "/tooltips", name: "Tooltips & Popovers Demo", description: "Tooltips and popovers with various positions and actions" },
    { path: "/iframe", name: "Iframe Demo", description: "Embedded content in an iframe" },
    { path: "/graph", name: "Graph Demo", description: "Drag and drop nodes to build graphs" },
    { path: "/restaurants", name: "Restaurants Map", description: "Mapbox integration with NYC restaurants" },
    { path: "/otp", name: "OTP Demo", description: "One-Time Password generation and validation" },
    { path: "/loading-demo", name: "Loading Demo", description: "Loading states, skeletons, and spinners" },
  ];

  console.log(`Hi there! 👋 If you're exploring the code, feel free to reach out at t@desplega.ai!`)

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <a
              href="https://desplega.ai?utm_source=evals"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              desplega.ai
            </a> evals
          </h1>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${viewMode === "list"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-700 hover:text-gray-900"
                  }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${viewMode === "table"
                  ? "bg-white text-gray-900 shadow"
                  : "text-gray-700 hover:text-gray-900"
                  }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          {/* List View */}
          {viewMode === "list" && (
            <div className="grid gap-4">
              {routes.map((route) => {
                if (route.path === "/graph") {
                  return (
                    <div
                      key={route.path}
                      className={`block p-4 border rounded-lg ${route.isFeatured
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                        }`}
                    >
                      <h3 className="text-lg font-medium mb-1">{route.name}</h3>
                      <p className="text-gray-600 mb-3">{route.description}</p>
                      <div className="flex gap-2">
                        <Link
                          href="/graph?empty"
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Empty Canvas
                        </Link>
                        <Link
                          href="/graph?seed=default"
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          With Seed
                        </Link>
                      </div>
                    </div>
                  );
                }

                if (route.path === "/loading-demo") {
                  return (
                    <div
                      key={route.path}
                      className="block p-4 border rounded-lg border-gray-300"
                    >
                      <h3 className="text-lg font-medium mb-1">{route.name}</h3>
                      <p className="text-gray-600 mb-3">{route.description}</p>
                      <div className="flex gap-2">
                        <Link
                          href="/loading-demo"
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Normal
                        </Link>
                        <Link
                          href="/loading-demo?fullpage"
                          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          Full Page Spinner (5s)
                        </Link>
                      </div>
                    </div>
                  );
                }

                const href = route.path === "/otp" ? "/otp?seed=1337" : route.path;
                return (
                  <Link
                    key={route.path}
                    href={href}
                    className={`block p-4 border rounded-lg transition-colors ${route.isFeatured
                      ? "border-blue-500 bg-blue-50 hover:bg-blue-100 shadow-md"
                      : "border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {route.isFeatured && (
                      <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mb-2">
                        Featured
                      </span>
                    )}
                    <h3 className="text-lg font-medium">{route.name}</h3>
                    <p className="text-gray-600">{route.description}</p>
                    <span className="text-sm text-blue-600">→ {href}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900">
                      Path
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-900">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr
                      key={route.path}
                      className={`transition-colors ${route.isFeatured
                        ? "bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                        }`}
                    >
                      <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">
                        {route.isFeatured && (
                          <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded mr-2">
                            Featured
                          </span>
                        )}
                        {route.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-600">
                        {route.description}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 font-mono text-sm text-gray-700">
                        {route.path}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {route.path === "/graph" ? (
                          <div className="flex gap-2 justify-center">
                            <Link
                              href="/graph?empty"
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Empty
                            </Link>
                            <Link
                              href="/graph?seed=default"
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Seed
                            </Link>
                          </div>
                        ) : route.path === "/loading-demo" ? (
                          <div className="flex gap-2 justify-center">
                            <Link
                              href="/loading-demo"
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Normal
                            </Link>
                            <Link
                              href="/loading-demo?fullpage"
                              className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            >
                              Full Page
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={route.path === "/otp" ? "/otp?seed=1337" : route.path}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-block"
                          >
                            Visit
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
