"use client";

import Link from "next/link";
import { useState } from "react";

export default function IframePage() {
  const [iframeUrl, setIframeUrl] = useState("https://desplega-ai-evals.vercel.app/visible");
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Force refresh by changing and restoring the URL
    setIframeUrl("");
    setTimeout(() => {
      setIframeUrl("https://desplega-ai-evals.vercel.app/visible");
    }, 0);
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-7xl mx-auto h-full">
        <div className="mb-6">
          <Link 
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Iframe Demo</h1>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Embedded Content</h2>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh Iframe
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Showing: <code className="bg-gray-200 px-2 py-1 rounded">{iframeUrl}</code>
            </p>
          </div>

          <div className="relative bg-white border border-gray-300 rounded-lg overflow-hidden" style={{ height: "600px" }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading iframe...</p>
                </div>
              </div>
            )}
            
            {iframeUrl && (
              <iframe
                src={iframeUrl}
                className="w-full h-full"
                title="Embedded content"
                onLoad={handleIframeLoad}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Iframe Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• This iframe displays content from another webpage</li>
              <li>• The embedded page can be interacted with directly</li>
              <li>• Some features may be restricted due to security policies</li>
              <li>• The iframe has a fixed height of 600px</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}