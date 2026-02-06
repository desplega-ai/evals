"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";

// --- Data generation ---

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  inStock: boolean;
}

interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
}

// Generate 100 products deterministically
function generateProducts(): Product[] {
  const categories = ["Electronics", "Clothing", "Books", "Home", "Sports", "Toys", "Food", "Garden"];
  const adjectives = ["Premium", "Classic", "Modern", "Vintage", "Ultra", "Compact", "Deluxe", "Essential"];
  const nouns = ["Widget", "Gadget", "Device", "Tool", "Kit", "Set", "Pack", "Bundle"];

  return Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `${adjectives[i % adjectives.length]} ${nouns[Math.floor(i / adjectives.length) % nouns.length]} ${i + 1}`,
    category: categories[i % categories.length],
    price: Math.round((10 + ((i * 7 + 3) % 990)) * 100) / 100,
    rating: Math.round((1 + ((i * 3 + 2) % 40) / 10) * 10) / 10,
    inStock: i % 5 !== 0, // Every 5th product is out of stock
  }));
}

// Generate 200 comments for infinite scroll
function generateComments(): Comment[] {
  const authors = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack"];
  const phrases = [
    "This is really interesting, I think we should explore this further.",
    "Great point! I completely agree with this perspective.",
    "I'm not sure about this one, could you elaborate more?",
    "This changed my mind about the whole topic.",
    "Has anyone else experienced something similar?",
    "Absolutely fantastic insight, thanks for sharing!",
    "I have a different take on this matter entirely.",
    "This reminds me of a similar discussion we had last week.",
    "Can someone verify these claims with data?",
    "Well said! This deserves more attention.",
  ];

  return Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    author: authors[i % authors.length],
    text: phrases[i % phrases.length],
    timestamp: new Date(2025, 0, 1 + Math.floor(i / 5), 10 + (i % 14), (i * 7) % 60).toISOString(),
    likes: (i * 13 + 5) % 100,
  }));
}

// Generate 50 log entries for cursor-based pagination
interface LogEntry {
  id: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
}

function generateLogs(): LogEntry[] {
  const levels: LogEntry["level"][] = ["info", "warn", "error", "debug"];
  const messages = [
    "Server started on port 3000",
    "Database connection established",
    "Cache miss for key user:session:abc",
    "Rate limit exceeded for IP 192.168.1.42",
    "Failed to parse JSON response from external API",
    "Scheduled job cron:cleanup completed in 2.3s",
    "Memory usage at 78% - approaching threshold",
    "User authentication successful for user_id=847",
    "WebSocket connection closed unexpectedly",
    "Config file reloaded with 3 changes",
  ];

  return Array.from({ length: 50 }, (_, i) => ({
    id: `log-${String(i + 1).padStart(3, "0")}`,
    level: levels[i % levels.length],
    message: messages[i % messages.length],
    timestamp: new Date(2025, 5, 15, 8 + Math.floor(i / 6), (i * 3) % 60, (i * 17) % 60).toISOString(),
  }));
}

const allProducts = generateProducts();
const allComments = generateComments();
const allLogs = generateLogs();

// The "target" items agents need to find
const TARGET_PRODUCT_ID = 47;
const TARGET_COMMENT_ID = 137;
const TARGET_LOG_ID = "log-033";

export default function PaginationPage() {
  // Section 1: Classic pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Section 2: Infinite scroll
  const [loadedComments, setLoadedComments] = useState<Comment[]>(() => allComments.slice(0, 20));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Section 3: Load More button
  const [loadMorePage, setLoadMorePage] = useState(1);
  const LOAD_MORE_SIZE = 5;

  // Section 4: Cursor-based pagination
  const [cursorIndex, setCursorIndex] = useState(0);
  const CURSOR_PAGE_SIZE = 10;

  // --- Section 1: Filtered + paginated products ---
  const filteredProducts = allProducts.filter((p) => {
    const matchesSearch = searchTerm === "" || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const categories = [...new Set(allProducts.map((p) => p.category))].sort();

  const targetProduct = allProducts.find((p) => p.id === TARGET_PRODUCT_ID);

  // --- Section 2: Infinite scroll ---
  const hasMoreComments = loadedComments.length < allComments.length;

  const loadMoreComments = useCallback(() => {
    if (isLoadingMore || !hasMoreComments) return;
    setIsLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setLoadedComments((prev) => {
        const nextBatch = allComments.slice(prev.length, prev.length + 20);
        return [...prev, ...nextBatch];
      });
      setIsLoadingMore(false);
    }, 800);
  }, [isLoadingMore, hasMoreComments]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [loadMoreComments]);

  // --- Section 3: Load More ---
  const loadMoreLogs = allLogs.slice(0, loadMorePage * LOAD_MORE_SIZE);
  const hasMoreLogs = loadMoreLogs.length < allLogs.length;

  // --- Section 4: Cursor-based ---
  const cursorLogs = allLogs.slice(cursorIndex, cursorIndex + CURSOR_PAGE_SIZE);
  const hasNextCursor = cursorIndex + CURSOR_PAGE_SIZE < allLogs.length;
  const hasPrevCursor = cursorIndex > 0;

  const levelColor: Record<string, string> = {
    info: "bg-blue-100 text-blue-700",
    warn: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    debug: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Infinite Scroll & Pagination Demo</h1>
        <p className="text-gray-600 mb-8">
          Test different data-loading patterns. Not all data is visible at once -- you must paginate, scroll, or load more to find specific items.
        </p>

        <div className="space-y-16">
          {/* Section 1: Classic Pagination */}
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Classic Pagination with Filters</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Find product #{TARGET_PRODUCT_ID} (&quot;{targetProduct?.name}&quot;).
              It may require changing pages, adjusting page size, or using search/filters.
            </p>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search products..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                data-testid="search-input"
              />
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                data-testid="category-filter"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                data-testid="page-size"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Rating</th>
                    <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      data-testid={`product-row-${product.id}`}
                      className={`border-b border-gray-100 transition-colors ${
                        product.id === TARGET_PRODUCT_ID ? "bg-yellow-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-2 text-sm font-mono text-gray-500">#{product.id}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{product.category}</td>
                      <td className="px-4 py-2 text-sm text-right font-mono">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-center">{product.rating}/5</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} products
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="page-first"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="page-prev"
                >
                  Prev
                </button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      data-testid={`page-${pageNum}`}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="page-next"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  data-testid="page-last"
                >
                  Last
                </button>
              </div>
            </div>
          </section>

          {/* Section 2: Infinite Scroll */}
          <section>
            <h2 className="text-xl font-semibold mb-2">2. Infinite Scroll Comments</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Scroll down to find comment #{TARGET_COMMENT_ID} by &quot;{allComments[TARGET_COMMENT_ID - 1]?.author}&quot;.
              Comments load automatically as you scroll. Currently loaded: {loadedComments.length}/{allComments.length}.
            </p>

            <div className="border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto" data-testid="comment-scroll-container">
              <div className="divide-y divide-gray-100">
                {loadedComments.map((comment) => (
                  <div
                    key={comment.id}
                    data-testid={`comment-${comment.id}`}
                    className={`px-4 py-3 transition-colors ${
                      comment.id === TARGET_COMMENT_ID ? "bg-yellow-50 border-l-4 border-l-yellow-400" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">#{comment.id}</span>
                        <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">{comment.likes} likes</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{comment.text}</p>
                  </div>
                ))}
              </div>

              {/* Intersection observer trigger */}
              {hasMoreComments && (
                <div ref={observerRef} className="px-4 py-6 text-center">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-500">Loading more comments...</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Scroll to load more</span>
                  )}
                </div>
              )}

              {!hasMoreComments && (
                <div className="px-4 py-4 text-center text-sm text-gray-500 bg-gray-50">
                  All {allComments.length} comments loaded.
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Load More Button */}
          <section>
            <h2 className="text-xl font-semibold mb-2">3. Load More Button</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Find log entry &quot;{TARGET_LOG_ID}&quot; by clicking &quot;Load More&quot; until it appears.
            </p>

            <div className="border border-gray-200 rounded-lg overflow-hidden max-w-2xl">
              <div className="bg-gray-900 text-gray-100 font-mono text-sm">
                {loadMoreLogs.map((log) => (
                  <div
                    key={log.id}
                    data-testid={`log-${log.id}`}
                    className={`flex items-start gap-3 px-4 py-2 border-b border-gray-800 ${
                      log.id === TARGET_LOG_ID ? "bg-yellow-900/30" : ""
                    }`}
                  >
                    <span className="text-gray-500 min-w-[70px]">{log.id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold uppercase min-w-[50px] text-center ${
                      log.level === "info" ? "bg-blue-900 text-blue-300" :
                      log.level === "warn" ? "bg-yellow-900 text-yellow-300" :
                      log.level === "error" ? "bg-red-900 text-red-300" :
                      "bg-gray-700 text-gray-300"
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-gray-400 min-w-[140px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-gray-200 flex-1">{log.message}</span>
                  </div>
                ))}
              </div>

              {hasMoreLogs && (
                <div className="px-4 py-3 bg-gray-800 text-center">
                  <button
                    onClick={() => setLoadMorePage((p) => p + 1)}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    data-testid="load-more-btn"
                  >
                    Load More ({loadMoreLogs.length}/{allLogs.length} loaded)
                  </button>
                </div>
              )}

              {!hasMoreLogs && (
                <div className="px-4 py-3 bg-gray-800 text-center text-sm text-gray-400">
                  All {allLogs.length} log entries loaded.
                </div>
              )}
            </div>
          </section>

          {/* Section 4: Cursor-Based Pagination */}
          <section>
            <h2 className="text-xl font-semibold mb-2">4. Cursor-Based Pagination</h2>
            <p className="text-gray-600 mb-4">
              <strong>Challenge:</strong> Navigate through log pages using Next/Previous to find entry &quot;{TARGET_LOG_ID}&quot;.
              This simulates an API with cursor-based pagination (no random page access).
            </p>

            <div className="border border-gray-200 rounded-lg overflow-hidden max-w-2xl">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing entries {cursorIndex + 1}-{Math.min(cursorIndex + CURSOR_PAGE_SIZE, allLogs.length)} of {allLogs.length}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  cursor: {cursorIndex}
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {cursorLogs.map((log) => (
                  <div
                    key={log.id}
                    data-testid={`cursor-${log.id}`}
                    className={`flex items-center gap-3 px-4 py-2.5 ${
                      log.id === TARGET_LOG_ID ? "bg-yellow-50 border-l-4 border-l-yellow-400" : ""
                    }`}
                  >
                    <span className="text-sm font-mono text-gray-500 min-w-[70px]">{log.id}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${levelColor[log.level]}`}>
                      {log.level}
                    </span>
                    <span className="text-sm text-gray-600 flex-1">{log.message}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setCursorIndex((i) => Math.max(i - CURSOR_PAGE_SIZE, 0))}
                  disabled={!hasPrevCursor}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  data-testid="cursor-prev"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {Math.floor(cursorIndex / CURSOR_PAGE_SIZE) + 1} of {Math.ceil(allLogs.length / CURSOR_PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setCursorIndex((i) => Math.min(i + CURSOR_PAGE_SIZE, allLogs.length - CURSOR_PAGE_SIZE))}
                  disabled={!hasNextCursor}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  data-testid="cursor-next"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
