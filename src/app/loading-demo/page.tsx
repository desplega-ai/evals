"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type LoadingState = "idle" | "loading" | "loaded";

interface LoadingDemo {
  id: string;
  label: string;
  duration: number;
  state: LoadingState;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-300 rounded ${className}`}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
    </tr>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function SpinnerLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function LoadedCard() {
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(false);
  const [purchased, setPurchased] = useState(false);

  return (
    <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-3">
      <h3 className="font-semibold text-green-800">Product Name</h3>
      <p className="text-sm text-green-600">Category: Electronics</p>
      <p className="text-gray-700">
        This is the actual content that appears after loading. It contains real data
        that was fetched from the server.
      </p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">Quantity:</span>
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          +
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setPurchased(true)}
          disabled={purchased}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            purchased
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {purchased ? "Purchased!" : "Buy Now"}
        </button>
        <button
          onClick={() => setInCart(!inCart)}
          className={`px-3 py-1 border rounded text-sm transition-colors ${
            inCart
              ? "bg-green-600 border-green-600 text-white"
              : "border-green-600 text-green-600 hover:bg-green-50"
          }`}
        >
          {inCart ? "In Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

function LoadedTable() {
  const [data, setData] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Pending" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", status: "Active" },
  ]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const toggleStatus = (id: number) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, status: row.status === "Active" ? "Pending" : "Active" }
          : row
      )
    );
  };

  const toggleSelect = (id: number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const deleteSelected = () => {
    setData((prev) => prev.filter((row) => !selectedRows.has(row.id)));
    setSelectedRows(new Set());
  };

  return (
    <div>
      {selectedRows.size > 0 && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm text-gray-600">{selectedRows.size} selected</span>
          <button
            onClick={deleteSelected}
            className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Delete Selected
          </button>
        </div>
      )}
      <table className="w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left border-b w-10">
              <input
                type="checkbox"
                checked={selectedRows.size === data.length && data.length > 0}
                onChange={() => {
                  if (selectedRows.size === data.length) {
                    setSelectedRows(new Set());
                  } else {
                    setSelectedRows(new Set(data.map((r) => r.id)));
                  }
                }}
                className="w-4 h-4"
              />
            </th>
            <th className="px-4 py-2 text-left border-b">ID</th>
            <th className="px-4 py-2 text-left border-b">Name</th>
            <th className="px-4 py-2 text-left border-b">Email</th>
            <th className="px-4 py-2 text-left border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className={`border-b transition-colors ${
                selectedRows.has(row.id) ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedRows.has(row.id)}
                  onChange={() => toggleSelect(row.id)}
                  className="w-4 h-4"
                />
              </td>
              <td className="px-4 py-3">{row.id}</td>
              <td className="px-4 py-3">{row.name}</td>
              <td className="px-4 py-3">{row.email}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleStatus(row.id)}
                  className={`px-2 py-1 rounded text-sm cursor-pointer transition-colors ${
                    row.status === "Active"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                  }`}
                >
                  {row.status}
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function LoadedProfile() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [likes, setLikes] = useState(42);
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes((l) => (liked ? l - 1 : l + 1));
  };

  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
        JD
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">John Doe</h3>
        <p className="text-sm text-gray-500">Software Engineer</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              isFollowing
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
          <button
            onClick={toggleLike}
            className={`px-3 py-1 text-xs rounded flex items-center gap-1 transition-colors ${
              liked
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{liked ? "♥" : "♡"}</span>
            <span>{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-600 text-lg">Loading page...</p>
    </div>
  );
}

function LoadingDemoContent() {
  const searchParams = useSearchParams();
  const isFullPage = searchParams.has("fullpage");
  const [pageLoading, setPageLoading] = useState(isFullPage);

  useEffect(() => {
    if (isFullPage) {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isFullPage]);

  const [demos, setDemos] = useState<LoadingDemo[]>([
    { id: "card", label: "Card (2s)", duration: 2000, state: "idle" },
    { id: "table", label: "Table (3s)", duration: 3000, state: "idle" },
    { id: "profile", label: "Profile (1s)", duration: 1000, state: "idle" },
    { id: "spinner", label: "Spinner (4s)", duration: 4000, state: "idle" },
  ]);

  const triggerLoading = (id: string) => {
    const demo = demos.find((d) => d.id === id);
    if (!demo) return;

    setDemos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, state: "loading" } : d))
    );

    setTimeout(() => {
      setDemos((prev) =>
        prev.map((d) => (d.id === id ? { ...d, state: "loaded" } : d))
      );
    }, demo.duration);
  };

  const resetDemo = (id: string) => {
    setDemos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, state: "idle" } : d))
    );
  };

  const triggerAll = () => {
    demos.forEach((demo) => triggerLoading(demo.id));
  };

  const resetAll = () => {
    setDemos((prev) => prev.map((d) => ({ ...d, state: "idle" })));
  };

  const getDemo = (id: string) => demos.find((d) => d.id === id)!;

  if (pageLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Loading States Demo</h1>

        {/* Control Buttons */}
        <section className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Controls</h2>
          <div className="flex flex-wrap gap-3">
            {demos.map((demo) => (
              <button
                key={demo.id}
                onClick={() =>
                  demo.state === "idle"
                    ? triggerLoading(demo.id)
                    : resetDemo(demo.id)
                }
                disabled={demo.state === "loading"}
                className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                  demo.state === "loading"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : demo.state === "loaded"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {demo.state === "loading"
                  ? `Loading ${demo.label}...`
                  : demo.state === "loaded"
                  ? `Reset ${demo.label}`
                  : `Load ${demo.label}`}
              </button>
            ))}
            <button
              onClick={triggerAll}
              className="px-4 py-2 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 transition-all duration-200"
            >
              Trigger All
            </button>
            <button
              onClick={resetAll}
              className="px-4 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-all duration-200"
            >
              Reset All
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Demo */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Card Loading</h2>
            <div className="min-h-[180px]">
              {getDemo("card").state === "idle" && (
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                  Click &quot;Load Card&quot; to see skeleton loading
                </div>
              )}
              {getDemo("card").state === "loading" && <CardSkeleton />}
              {getDemo("card").state === "loaded" && <LoadedCard />}
            </div>
          </section>

          {/* Profile Demo */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Profile Loading</h2>
            <div className="min-h-[80px]">
              {getDemo("profile").state === "idle" && (
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                  Click &quot;Load Profile&quot; to see skeleton loading
                </div>
              )}
              {getDemo("profile").state === "loading" && <ProfileSkeleton />}
              {getDemo("profile").state === "loaded" && <LoadedProfile />}
            </div>
          </section>

          {/* Table Demo */}
          <section className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Table Loading</h2>
            <div className="min-h-[200px]">
              {getDemo("table").state === "idle" && (
                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                  Click &quot;Load Table&quot; to see skeleton loading
                </div>
              )}
              {getDemo("table").state === "loading" && (
                <table className="w-full border-collapse border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left border-b">ID</th>
                      <th className="px-4 py-2 text-left border-b">Name</th>
                      <th className="px-4 py-2 text-left border-b">Email</th>
                      <th className="px-4 py-2 text-left border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </tbody>
                </table>
              )}
              {getDemo("table").state === "loaded" && <LoadedTable />}
            </div>
          </section>

          {/* Spinner Demo */}
          <section className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Spinner Loading</h2>
            <div className="min-h-[100px] border border-gray-200 rounded-lg">
              {getDemo("spinner").state === "idle" && (
                <div className="p-4 text-center text-gray-500">
                  Click &quot;Load Spinner&quot; to see spinner loading
                </div>
              )}
              {getDemo("spinner").state === "loading" && <SpinnerLoader />}
              {getDemo("spinner").state === "loaded" && (
                <div className="p-4 text-center text-green-600 font-medium">
                  Desplegillo ready!
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function LoadingDemoPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <LoadingDemoContent />
    </Suspense>
  );
}
