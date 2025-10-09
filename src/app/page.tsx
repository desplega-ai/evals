import Link from "next/link";

export default function Home() {
  const routes = [
    { path: "/table", name: "Table Demo", description: "View dummy table data" },
    { path: "/checkboxes", name: "Checkboxes Demo", description: "Different checkbox types" },
    { path: "/visible", name: "Visibility Demo", description: "Interaction with visible and not visible elements" },
    { path: "/buttons", name: "Buttons Demo", description: "Interaction with different types of buttons" },
    { path: "/files", name: "Files Demo", description: "Upload and download files" },
    { path: "/iframe", name: "Iframe Demo", description: "Embedded content in an iframe" },
    { path: "/graph", name: "Graph Demo", description: "Drag and drop nodes to build graphs" },
  ];

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          <a
            href="https://desplega.ai?utm_source=evals"
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            desplega.ai
          </a> sample evals
        </h1>

        <div className="mb-8">
          <div className="grid gap-4">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="block p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-medium">{route.name}</h3>
                <p className="text-gray-600">{route.description}</p>
                <span className="text-sm text-blue-600">→ {route.path}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
