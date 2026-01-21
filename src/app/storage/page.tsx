"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface StorageItem {
  key: string;
  value: string;
}

interface IndexedDBRecord {
  id: number;
  name: string;
  value: string;
  timestamp: number;
}

const DB_NAME = "EvalsTestDB";
const STORE_NAME = "testStore";

export default function StoragePage() {
  // Local Storage State
  const [localStorageItems, setLocalStorageItems] = useState<StorageItem[]>([]);
  const [localKey, setLocalKey] = useState("");
  const [localValue, setLocalValue] = useState("");

  // Session Storage State
  const [sessionStorageItems, setSessionStorageItems] = useState<StorageItem[]>([]);
  const [sessionKey, setSessionKey] = useState("");
  const [sessionValue, setSessionValue] = useState("");

  // Cookies State
  const [cookies, setCookies] = useState<StorageItem[]>([]);
  const [cookieKey, setCookieKey] = useState("");
  const [cookieValue, setCookieValue] = useState("");
  const [cookieExpiry, setCookieExpiry] = useState("session");

  // IndexedDB State
  const [indexedDBRecords, setIndexedDBRecords] = useState<IndexedDBRecord[]>([]);
  const [idbName, setIdbName] = useState("");
  const [idbValue, setIdbValue] = useState("");
  const [dbReady, setDbReady] = useState(false);

  // Load Local Storage items
  const loadLocalStorage = useCallback(() => {
    const items: StorageItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        items.push({ key, value: localStorage.getItem(key) || "" });
      }
    }
    setLocalStorageItems(items);
  }, []);

  // Load Session Storage items
  const loadSessionStorage = useCallback(() => {
    const items: StorageItem[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        items.push({ key, value: sessionStorage.getItem(key) || "" });
      }
    }
    setSessionStorageItems(items);
  }, []);

  // Load Cookies
  const loadCookies = useCallback(() => {
    const cookieItems: StorageItem[] = [];
    const cookieString = document.cookie;
    if (cookieString) {
      const pairs = cookieString.split(";");
      pairs.forEach((pair) => {
        const [key, value] = pair.trim().split("=");
        if (key) {
          cookieItems.push({ key, value: decodeURIComponent(value || "") });
        }
      });
    }
    setCookies(cookieItems);
  }, []);

  // IndexedDB helper functions
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
      };
    });
  }, []);

  const loadIndexedDB = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        setIndexedDBRecords(request.result);
        setDbReady(true);
      };
      request.onerror = () => {
        console.error("Failed to load IndexedDB records");
      };
      transaction.oncomplete = () => db.close();
    } catch (error) {
      console.error("IndexedDB error:", error);
    }
  }, [openDB]);

  // Initial load
  useEffect(() => {
    loadLocalStorage();
    loadSessionStorage();
    loadCookies();
    loadIndexedDB();
  }, [loadLocalStorage, loadSessionStorage, loadCookies, loadIndexedDB]);

  // Local Storage operations
  const addLocalStorage = () => {
    if (localKey.trim()) {
      localStorage.setItem(localKey, localValue);
      setLocalKey("");
      setLocalValue("");
      loadLocalStorage();
    }
  };

  const removeLocalStorage = (key: string) => {
    localStorage.removeItem(key);
    loadLocalStorage();
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    loadLocalStorage();
  };

  // Session Storage operations
  const addSessionStorage = () => {
    if (sessionKey.trim()) {
      sessionStorage.setItem(sessionKey, sessionValue);
      setSessionKey("");
      setSessionValue("");
      loadSessionStorage();
    }
  };

  const removeSessionStorage = (key: string) => {
    sessionStorage.removeItem(key);
    loadSessionStorage();
  };

  const clearSessionStorage = () => {
    sessionStorage.clear();
    loadSessionStorage();
  };

  // Cookie operations
  const addCookie = () => {
    if (cookieKey.trim()) {
      let cookieString = `${encodeURIComponent(cookieKey)}=${encodeURIComponent(cookieValue)}`;
      if (cookieExpiry !== "session") {
        const days = parseInt(cookieExpiry);
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
      }
      cookieString += "; path=/";
      document.cookie = cookieString;
      setCookieKey("");
      setCookieValue("");
      loadCookies();
    }
  };

  const removeCookie = (key: string) => {
    document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    loadCookies();
  };

  const clearAllCookies = () => {
    cookies.forEach((cookie) => {
      document.cookie = `${encodeURIComponent(cookie.key)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    loadCookies();
  };

  // IndexedDB operations
  const addIndexedDBRecord = async () => {
    if (idbName.trim()) {
      try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const record: Omit<IndexedDBRecord, "id"> = {
          name: idbName,
          value: idbValue,
          timestamp: Date.now(),
        };
        store.add(record);
        transaction.oncomplete = () => {
          db.close();
          setIdbName("");
          setIdbValue("");
          loadIndexedDB();
        };
      } catch (error) {
        console.error("Failed to add IndexedDB record:", error);
      }
    }
  };

  const removeIndexedDBRecord = async (id: number) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);
      transaction.oncomplete = () => {
        db.close();
        loadIndexedDB();
      };
    } catch (error) {
      console.error("Failed to remove IndexedDB record:", error);
    }
  };

  const clearIndexedDB = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      transaction.oncomplete = () => {
        db.close();
        loadIndexedDB();
      };
    } catch (error) {
      console.error("Failed to clear IndexedDB:", error);
    }
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Browser Storage Demo</h1>

        <div className="space-y-12">
          {/* Local Storage Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Local Storage</h2>
            <p className="text-gray-600 mb-4">
              Persistent storage that survives browser restarts. Data remains until explicitly cleared.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Key"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="local-storage-key"
              />
              <input
                type="text"
                placeholder="Value"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="local-storage-value"
              />
              <button
                onClick={addLocalStorage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                data-testid="local-storage-add"
              >
                Add
              </button>
              <button
                onClick={clearLocalStorage}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                data-testid="local-storage-clear"
              >
                Clear All
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Stored Items ({localStorageItems.length})</h3>
              {localStorageItems.length === 0 ? (
                <p className="text-gray-500 italic" data-testid="local-storage-empty">No items stored</p>
              ) : (
                <ul className="space-y-2" data-testid="local-storage-list">
                  {localStorageItems.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-center justify-between bg-white p-2 rounded border"
                      data-testid={`local-storage-item-${item.key}`}
                    >
                      <span>
                        <code className="text-purple-600">{item.key}</code>:{" "}
                        <span className="text-gray-700">{item.value}</span>
                      </span>
                      <button
                        onClick={() => removeLocalStorage(item.key)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`local-storage-remove-${item.key}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Session Storage Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Session Storage</h2>
            <p className="text-gray-600 mb-4">
              Temporary storage that is cleared when the browser tab is closed.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Key"
                value={sessionKey}
                onChange={(e) => setSessionKey(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="session-storage-key"
              />
              <input
                type="text"
                placeholder="Value"
                value={sessionValue}
                onChange={(e) => setSessionValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="session-storage-value"
              />
              <button
                onClick={addSessionStorage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                data-testid="session-storage-add"
              >
                Add
              </button>
              <button
                onClick={clearSessionStorage}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                data-testid="session-storage-clear"
              >
                Clear All
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Stored Items ({sessionStorageItems.length})</h3>
              {sessionStorageItems.length === 0 ? (
                <p className="text-gray-500 italic" data-testid="session-storage-empty">No items stored</p>
              ) : (
                <ul className="space-y-2" data-testid="session-storage-list">
                  {sessionStorageItems.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-center justify-between bg-white p-2 rounded border"
                      data-testid={`session-storage-item-${item.key}`}
                    >
                      <span>
                        <code className="text-purple-600">{item.key}</code>:{" "}
                        <span className="text-gray-700">{item.value}</span>
                      </span>
                      <button
                        onClick={() => removeSessionStorage(item.key)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`session-storage-remove-${item.key}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Cookies Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <p className="text-gray-600 mb-4">
              Small pieces of data stored by the browser. Can be set to expire or last for the session.
            </p>

            <div className="flex gap-2 mb-4 flex-wrap">
              <input
                type="text"
                placeholder="Name"
                value={cookieKey}
                onChange={(e) => setCookieKey(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="cookie-key"
              />
              <input
                type="text"
                placeholder="Value"
                value={cookieValue}
                onChange={(e) => setCookieValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="cookie-value"
              />
              <select
                value={cookieExpiry}
                onChange={(e) => setCookieExpiry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="cookie-expiry"
              >
                <option value="session">Session</option>
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="365">1 Year</option>
              </select>
              <button
                onClick={addCookie}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                data-testid="cookie-add"
              >
                Add
              </button>
              <button
                onClick={clearAllCookies}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                data-testid="cookie-clear"
              >
                Clear All
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Stored Cookies ({cookies.length})</h3>
              {cookies.length === 0 ? (
                <p className="text-gray-500 italic" data-testid="cookie-empty">No cookies stored</p>
              ) : (
                <ul className="space-y-2" data-testid="cookie-list">
                  {cookies.map((cookie) => (
                    <li
                      key={cookie.key}
                      className="flex items-center justify-between bg-white p-2 rounded border"
                      data-testid={`cookie-item-${cookie.key}`}
                    >
                      <span>
                        <code className="text-purple-600">{cookie.key}</code>:{" "}
                        <span className="text-gray-700">{cookie.value}</span>
                      </span>
                      <button
                        onClick={() => removeCookie(cookie.key)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`cookie-remove-${cookie.key}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* IndexedDB Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">IndexedDB</h2>
            <p className="text-gray-600 mb-4">
              A low-level API for client-side storage of structured data, including files and blobs.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={idbName}
                onChange={(e) => setIdbName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="indexeddb-name"
              />
              <input
                type="text"
                placeholder="Value"
                value={idbValue}
                onChange={(e) => setIdbValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="indexeddb-value"
              />
              <button
                onClick={addIndexedDBRecord}
                disabled={!dbReady}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                data-testid="indexeddb-add"
              >
                Add
              </button>
              <button
                onClick={clearIndexedDB}
                disabled={!dbReady}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                data-testid="indexeddb-clear"
              >
                Clear All
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">
                Stored Records ({indexedDBRecords.length})
                {!dbReady && <span className="text-yellow-600 ml-2">(Loading...)</span>}
              </h3>
              {indexedDBRecords.length === 0 ? (
                <p className="text-gray-500 italic" data-testid="indexeddb-empty">No records stored</p>
              ) : (
                <ul className="space-y-2" data-testid="indexeddb-list">
                  {indexedDBRecords.map((record) => (
                    <li
                      key={record.id}
                      className="flex items-center justify-between bg-white p-2 rounded border"
                      data-testid={`indexeddb-item-${record.id}`}
                    >
                      <span>
                        <code className="text-purple-600">#{record.id}</code>{" "}
                        <span className="font-medium">{record.name}</span>:{" "}
                        <span className="text-gray-700">{record.value}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          ({new Date(record.timestamp).toLocaleTimeString()})
                        </span>
                      </span>
                      <button
                        onClick={() => removeIndexedDBRecord(record.id)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`indexeddb-remove-${record.id}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Storage Comparison */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Storage Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Feature</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Local Storage</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Session Storage</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Cookies</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">IndexedDB</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Capacity</td>
                    <td className="border border-gray-300 px-4 py-2">~5-10 MB</td>
                    <td className="border border-gray-300 px-4 py-2">~5-10 MB</td>
                    <td className="border border-gray-300 px-4 py-2">~4 KB</td>
                    <td className="border border-gray-300 px-4 py-2">Large (GB+)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">Persistence</td>
                    <td className="border border-gray-300 px-4 py-2">Until cleared</td>
                    <td className="border border-gray-300 px-4 py-2">Tab session</td>
                    <td className="border border-gray-300 px-4 py-2">Configurable</td>
                    <td className="border border-gray-300 px-4 py-2">Until cleared</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">Data Type</td>
                    <td className="border border-gray-300 px-4 py-2">String only</td>
                    <td className="border border-gray-300 px-4 py-2">String only</td>
                    <td className="border border-gray-300 px-4 py-2">String only</td>
                    <td className="border border-gray-300 px-4 py-2">Any (structured)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium">Sent to Server</td>
                    <td className="border border-gray-300 px-4 py-2">No</td>
                    <td className="border border-gray-300 px-4 py-2">No</td>
                    <td className="border border-gray-300 px-4 py-2">Yes (with requests)</td>
                    <td className="border border-gray-300 px-4 py-2">No</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 font-medium">API Complexity</td>
                    <td className="border border-gray-300 px-4 py-2">Simple</td>
                    <td className="border border-gray-300 px-4 py-2">Simple</td>
                    <td className="border border-gray-300 px-4 py-2">Low-level</td>
                    <td className="border border-gray-300 px-4 py-2">Complex (async)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
