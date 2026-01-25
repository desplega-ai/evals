"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// Fake database of users
const USERS_DB = [
  { id: 1, name: "Alice Anderson", email: "alice@example.com", role: "Engineer" },
  { id: 2, name: "Bob Baker", email: "bob@example.com", role: "Designer" },
  { id: 3, name: "Charlie Chen", email: "charlie@example.com", role: "Product Manager" },
  { id: 4, name: "Diana Davis", email: "diana@example.com", role: "Engineer" },
  { id: 5, name: "Edward Evans", email: "edward@example.com", role: "Marketing" },
  { id: 6, name: "Fiona Foster", email: "fiona@example.com", role: "Sales" },
  { id: 7, name: "George Garcia", email: "george@example.com", role: "Engineer" },
  { id: 8, name: "Hannah Hill", email: "hannah@example.com", role: "Designer" },
  { id: 9, name: "Ivan Ivanov", email: "ivan@example.com", role: "DevOps" },
  { id: 10, name: "Julia Johnson", email: "julia@example.com", role: "QA" },
  { id: 11, name: "Kevin Kim", email: "kevin@example.com", role: "Engineer" },
  { id: 12, name: "Laura Lee", email: "laura@example.com", role: "HR" },
  { id: 13, name: "Michael Martinez", email: "michael@example.com", role: "Finance" },
  { id: 14, name: "Nancy Nguyen", email: "nancy@example.com", role: "Engineer" },
  { id: 15, name: "Oscar O'Brien", email: "oscar@example.com", role: "Support" },
];

// Fake database of cities
const CITIES_DB = [
  { id: 1, name: "New York", country: "USA", population: "8.3M" },
  { id: 2, name: "Los Angeles", country: "USA", population: "3.9M" },
  { id: 3, name: "Chicago", country: "USA", population: "2.7M" },
  { id: 4, name: "London", country: "UK", population: "8.8M" },
  { id: 5, name: "Paris", country: "France", population: "2.2M" },
  { id: 6, name: "Tokyo", country: "Japan", population: "13.9M" },
  { id: 7, name: "Berlin", country: "Germany", population: "3.6M" },
  { id: 8, name: "Sydney", country: "Australia", population: "5.3M" },
  { id: 9, name: "Toronto", country: "Canada", population: "2.9M" },
  { id: 10, name: "Barcelona", country: "Spain", population: "1.6M" },
  { id: 11, name: "Amsterdam", country: "Netherlands", population: "0.9M" },
  { id: 12, name: "Singapore", country: "Singapore", population: "5.7M" },
  { id: 13, name: "Dubai", country: "UAE", population: "3.4M" },
  { id: 14, name: "Seoul", country: "South Korea", population: "9.7M" },
  { id: 15, name: "Mumbai", country: "India", population: "20.7M" },
];

type User = (typeof USERS_DB)[0];
type City = (typeof CITIES_DB)[0];

// Simulated API call with delay
async function searchUsers(query: string): Promise<User[]> {
  // Simulate network delay (300-800ms)
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

  if (!query.trim()) return [];

  const lower = query.toLowerCase();
  return USERS_DB.filter(
    (user) =>
      user.name.toLowerCase().includes(lower) ||
      user.email.toLowerCase().includes(lower) ||
      user.role.toLowerCase().includes(lower)
  );
}

async function searchCities(query: string): Promise<City[]> {
  // Simulate network delay (300-800ms)
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

  if (!query.trim()) return [];

  const lower = query.toLowerCase();
  return CITIES_DB.filter(
    (city) =>
      city.name.toLowerCase().includes(lower) || city.country.toLowerCase().includes(lower)
  );
}

// Generic Autocomplete component
function Autocomplete<T extends { id: number }>({
  placeholder,
  searchFn,
  renderOption,
  renderSelected,
  onSelect,
  debounceMs = 300,
  minChars = 1,
  label,
}: {
  placeholder: string;
  searchFn: (query: string) => Promise<T[]>;
  renderOption: (item: T, isHighlighted: boolean) => React.ReactNode;
  renderSelected: (item: T) => string;
  onSelect: (item: T | null) => void;
  debounceMs?: number;
  minChars?: number;
  label: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minChars) {
        setResults([]);
        setIsLoading(false);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const searchResults = await searchFn(searchQuery);
        setResults(searchResults);
        setHighlightedIndex(-1);
      } finally {
        setIsLoading(false);
      }
    },
    [searchFn, minChars]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedItem(null);
    onSelect(null);
    setIsOpen(true);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, debounceMs);
  };

  const handleSelect = (item: T) => {
    setSelectedItem(item);
    setQuery(renderSelected(item));
    setIsOpen(false);
    setResults([]);
    onSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.parentElement?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const showDropdown = isOpen && (isLoading || results.length > 0 || (hasSearched && query.length >= minChars));

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length >= minChars && !selectedItem) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            selectedItem ? "border-green-500 bg-green-50" : "border-gray-300"
          }`}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div
              className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
              aria-label="Loading"
            />
          </div>
        )}
        {selectedItem && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {showDropdown && (
        <ul
          ref={listRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {isLoading ? (
            <li className="px-4 py-3 text-gray-500 text-center">
              <span className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Searching...
              </span>
            </li>
          ) : results.length > 0 ? (
            results.map((item, index) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className="cursor-pointer"
                role="option"
                aria-selected={highlightedIndex === index}
              >
                {renderOption(item, highlightedIndex === index)}
              </li>
            ))
          ) : hasSearched && query.length >= minChars ? (
            <li className="px-4 py-3 text-gray-500 text-center" role="option" aria-disabled="true">
              No results found for &quot;{query}&quot;
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}

export default function AutocompletePage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [activityLog, setActivityLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setActivityLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Autocomplete Demo</h1>
        <p className="text-gray-600 mb-8">
          Test AI agent&apos;s ability to interact with typeahead search inputs with debounced API calls.
        </p>

        <div className="grid gap-8">
          {/* User Search */}
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">1. User Search</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Search for users by name, email, or role. Results appear after 300ms debounce + simulated
              API delay.
            </p>

            <Autocomplete
              label="Search Users"
              placeholder="Type a name, email, or role..."
              searchFn={searchUsers}
              renderOption={(user, isHighlighted) => (
                <div
                  className={`px-4 py-3 ${isHighlighted ? "bg-blue-100" : "hover:bg-gray-50"}`}
                >
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">
                    {user.email} · {user.role}
                  </div>
                </div>
              )}
              renderSelected={(user) => user.name}
              onSelect={(user) => {
                setSelectedUser(user);
                if (user) {
                  addLog(`Selected user: ${user.name} (${user.email})`);
                }
              }}
            />

            {selectedUser && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Selected User:</h3>
                <div className="text-sm text-green-700">
                  <p>
                    <strong>Name:</strong> {selectedUser.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {selectedUser.role}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* City Search */}
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">2. City Search</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Search for cities by name or country. Minimum 2 characters required.
            </p>

            <Autocomplete
              label="Search Cities"
              placeholder="Type a city or country..."
              searchFn={searchCities}
              minChars={2}
              debounceMs={400}
              renderOption={(city, isHighlighted) => (
                <div
                  className={`px-4 py-3 flex justify-between items-center ${
                    isHighlighted ? "bg-blue-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">{city.name}</div>
                    <div className="text-sm text-gray-500">{city.country}</div>
                  </div>
                  <div className="text-sm text-gray-400">Pop: {city.population}</div>
                </div>
              )}
              renderSelected={(city) => `${city.name}, ${city.country}`}
              onSelect={(city) => {
                setSelectedCity(city);
                if (city) {
                  addLog(`Selected city: ${city.name}, ${city.country}`);
                }
              }}
            />

            {selectedCity && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Selected City:</h3>
                <div className="text-sm text-green-700">
                  <p>
                    <strong>City:</strong> {selectedCity.name}
                  </p>
                  <p>
                    <strong>Country:</strong> {selectedCity.country}
                  </p>
                  <p>
                    <strong>Population:</strong> {selectedCity.population}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Edge Cases Section */}
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">3. Test Scenarios</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Try these searches:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <code className="bg-gray-100 px-1 rounded">eng</code> - finds multiple engineers
                </li>
                <li>
                  <code className="bg-gray-100 px-1 rounded">xyz</code> - triggers &quot;no results&quot;
                  state
                </li>
                <li>
                  <code className="bg-gray-100 px-1 rounded">al</code> - partial match for Alice
                </li>
                <li>
                  Type quickly then stop - observe debounce behavior
                </li>
                <li>
                  Use arrow keys and Enter to navigate/select
                </li>
              </ul>
            </div>
          </div>

          {/* Activity Log */}
          {activityLog.length > 0 && (
            <div className="p-6 border border-gray-300 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Activity Log</h2>
                <button
                  onClick={() => setActivityLog([])}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
              <div className="bg-gray-50 rounded p-3 max-h-40 overflow-auto">
                {activityLog.map((log, i) => (
                  <div key={i} className="text-sm text-gray-700 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
