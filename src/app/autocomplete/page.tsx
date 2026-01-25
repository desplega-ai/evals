"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";

// Expanded fake database of users
const USERS_DB = [
  { id: 1, name: "Alice Anderson", email: "alice.anderson@example.com", role: "Engineer" },
  { id: 2, name: "Bob Baker", email: "bob.baker@example.com", role: "Designer" },
  { id: 3, name: "Charlie Chen", email: "charlie.chen@example.com", role: "Product Manager" },
  { id: 4, name: "Diana Davis", email: "diana.davis@example.com", role: "Engineer" },
  { id: 5, name: "Edward Evans", email: "edward.evans@example.com", role: "Marketing" },
  { id: 6, name: "Fiona Foster", email: "fiona.foster@example.com", role: "Sales" },
  { id: 7, name: "George Garcia", email: "george.garcia@example.com", role: "Engineer" },
  { id: 8, name: "Hannah Hill", email: "hannah.hill@example.com", role: "Designer" },
  { id: 9, name: "Ivan Ivanov", email: "ivan.ivanov@example.com", role: "DevOps" },
  { id: 10, name: "Julia Johnson", email: "julia.johnson@example.com", role: "QA" },
  { id: 11, name: "Kevin Kim", email: "kevin.kim@example.com", role: "Engineer" },
  { id: 12, name: "Laura Lee", email: "laura.lee@example.com", role: "HR" },
  { id: 13, name: "Michael Martinez", email: "michael.martinez@example.com", role: "Finance" },
  { id: 14, name: "Nancy Nguyen", email: "nancy.nguyen@example.com", role: "Engineer" },
  { id: 15, name: "Oscar O'Brien", email: "oscar.obrien@example.com", role: "Support" },
  { id: 16, name: "Patricia Park", email: "patricia.park@example.com", role: "Engineer" },
  { id: 17, name: "Quentin Quinn", email: "quentin.quinn@example.com", role: "Data Scientist" },
  { id: 18, name: "Rachel Robinson", email: "rachel.robinson@example.com", role: "Designer" },
  { id: 19, name: "Samuel Smith", email: "samuel.smith@example.com", role: "Engineer" },
  { id: 20, name: "Tina Thompson", email: "tina.thompson@example.com", role: "Product Manager" },
  { id: 21, name: "Uma Underwood", email: "uma.underwood@example.com", role: "Marketing" },
  { id: 22, name: "Victor Valdez", email: "victor.valdez@example.com", role: "Engineer" },
  { id: 23, name: "Wendy Wang", email: "wendy.wang@example.com", role: "Designer" },
  { id: 24, name: "Xavier Xu", email: "xavier.xu@example.com", role: "DevOps" },
  { id: 25, name: "Yolanda Young", email: "yolanda.young@example.com", role: "QA" },
  { id: 26, name: "Zachary Zhang", email: "zachary.zhang@example.com", role: "Engineer" },
  { id: 27, name: "Amelia Adams", email: "amelia.adams@example.com", role: "Sales" },
  { id: 28, name: "Benjamin Brown", email: "benjamin.brown@example.com", role: "Finance" },
  { id: 29, name: "Catherine Clark", email: "catherine.clark@example.com", role: "HR" },
  { id: 30, name: "David Diaz", email: "david.diaz@example.com", role: "Support" },
  { id: 31, name: "Elena Edwards", email: "elena.edwards@example.com", role: "Engineer" },
  { id: 32, name: "Frank Fischer", email: "frank.fischer@example.com", role: "Designer" },
  { id: 33, name: "Grace Green", email: "grace.green@example.com", role: "Product Manager" },
  { id: 34, name: "Henry Harris", email: "henry.harris@example.com", role: "Engineer" },
  { id: 35, name: "Isabella Ibrahim", email: "isabella.ibrahim@example.com", role: "Data Scientist" },
  { id: 36, name: "James Jackson", email: "james.jackson@example.com", role: "DevOps" },
  { id: 37, name: "Karen King", email: "karen.king@example.com", role: "Marketing" },
  { id: 38, name: "Leo Lopez", email: "leo.lopez@example.com", role: "Engineer" },
  { id: 39, name: "Maria Moore", email: "maria.moore@example.com", role: "Designer" },
  { id: 40, name: "Nathan Nelson", email: "nathan.nelson@example.com", role: "QA" },
  { id: 41, name: "Olivia Ortiz", email: "olivia.ortiz@example.com", role: "Sales" },
  { id: 42, name: "Peter Patel", email: "peter.patel@example.com", role: "Engineer" },
  { id: 43, name: "Quinn Qureshi", email: "quinn.qureshi@example.com", role: "Finance" },
  { id: 44, name: "Rosa Rivera", email: "rosa.rivera@example.com", role: "HR" },
  { id: 45, name: "Steven Scott", email: "steven.scott@example.com", role: "Support" },
  { id: 46, name: "Teresa Taylor", email: "teresa.taylor@example.com", role: "Engineer" },
  { id: 47, name: "Ulysses Uribe", email: "ulysses.uribe@example.com", role: "Designer" },
  { id: 48, name: "Veronica Vargas", email: "veronica.vargas@example.com", role: "Product Manager" },
  { id: 49, name: "William Wilson", email: "william.wilson@example.com", role: "Engineer" },
  { id: 50, name: "Ximena Xiong", email: "ximena.xiong@example.com", role: "Data Scientist" },
  { id: 51, name: "Yusuf Yamamoto", email: "yusuf.yamamoto@example.com", role: "DevOps" },
  { id: 52, name: "Zara Zhou", email: "zara.zhou@example.com", role: "Marketing" },
  { id: 53, name: "Aaron Ali", email: "aaron.ali@example.com", role: "Engineer" },
  { id: 54, name: "Bianca Bauer", email: "bianca.bauer@example.com", role: "Designer" },
  { id: 55, name: "Carlos Castro", email: "carlos.castro@example.com", role: "QA" },
  { id: 56, name: "Daniela Dunn", email: "daniela.dunn@example.com", role: "Sales" },
  { id: 57, name: "Erik Eriksson", email: "erik.eriksson@example.com", role: "Engineer" },
  { id: 58, name: "Fatima Fernandez", email: "fatima.fernandez@example.com", role: "Finance" },
  { id: 59, name: "Gustav Graf", email: "gustav.graf@example.com", role: "HR" },
  { id: 60, name: "Hana Hashimoto", email: "hana.hashimoto@example.com", role: "Support" },
];

type User = (typeof USERS_DB)[0];

interface City {
  name: string;
  country: string;
  lat: string;
  lng: string;
  admin1: string;
  admin2: string;
}

// Country code to name mapping
const COUNTRY_NAMES: Record<string, string> = {
  AD: "Andorra", AE: "UAE", AF: "Afghanistan", AG: "Antigua", AL: "Albania",
  AM: "Armenia", AO: "Angola", AR: "Argentina", AT: "Austria", AU: "Australia",
  AZ: "Azerbaijan", BA: "Bosnia", BB: "Barbados", BD: "Bangladesh", BE: "Belgium",
  BF: "Burkina Faso", BG: "Bulgaria", BH: "Bahrain", BI: "Burundi", BJ: "Benin",
  BN: "Brunei", BO: "Bolivia", BR: "Brazil", BS: "Bahamas", BT: "Bhutan",
  BW: "Botswana", BY: "Belarus", BZ: "Belize", CA: "Canada", CD: "DR Congo",
  CF: "Central African Rep.", CG: "Congo", CH: "Switzerland", CI: "Ivory Coast",
  CL: "Chile", CM: "Cameroon", CN: "China", CO: "Colombia", CR: "Costa Rica",
  CU: "Cuba", CV: "Cape Verde", CY: "Cyprus", CZ: "Czechia", DE: "Germany",
  DJ: "Djibouti", DK: "Denmark", DM: "Dominica", DO: "Dominican Rep.", DZ: "Algeria",
  EC: "Ecuador", EE: "Estonia", EG: "Egypt", ER: "Eritrea", ES: "Spain",
  ET: "Ethiopia", FI: "Finland", FJ: "Fiji", FM: "Micronesia", FR: "France",
  GA: "Gabon", GB: "UK", GD: "Grenada", GE: "Georgia", GH: "Ghana",
  GM: "Gambia", GN: "Guinea", GQ: "Eq. Guinea", GR: "Greece", GT: "Guatemala",
  GW: "Guinea-Bissau", GY: "Guyana", HK: "Hong Kong", HN: "Honduras", HR: "Croatia",
  HT: "Haiti", HU: "Hungary", ID: "Indonesia", IE: "Ireland", IL: "Israel",
  IN: "India", IQ: "Iraq", IR: "Iran", IS: "Iceland", IT: "Italy",
  JM: "Jamaica", JO: "Jordan", JP: "Japan", KE: "Kenya", KG: "Kyrgyzstan",
  KH: "Cambodia", KI: "Kiribati", KM: "Comoros", KN: "St. Kitts", KP: "North Korea",
  KR: "South Korea", KW: "Kuwait", KZ: "Kazakhstan", LA: "Laos", LB: "Lebanon",
  LC: "St. Lucia", LI: "Liechtenstein", LK: "Sri Lanka", LR: "Liberia", LS: "Lesotho",
  LT: "Lithuania", LU: "Luxembourg", LV: "Latvia", LY: "Libya", MA: "Morocco",
  MC: "Monaco", MD: "Moldova", ME: "Montenegro", MG: "Madagascar", MH: "Marshall Is.",
  MK: "N. Macedonia", ML: "Mali", MM: "Myanmar", MN: "Mongolia", MO: "Macau",
  MR: "Mauritania", MT: "Malta", MU: "Mauritius", MV: "Maldives", MW: "Malawi",
  MX: "Mexico", MY: "Malaysia", MZ: "Mozambique", NA: "Namibia", NE: "Niger",
  NG: "Nigeria", NI: "Nicaragua", NL: "Netherlands", NO: "Norway", NP: "Nepal",
  NR: "Nauru", NZ: "New Zealand", OM: "Oman", PA: "Panama", PE: "Peru",
  PG: "Papua New Guinea", PH: "Philippines", PK: "Pakistan", PL: "Poland", PR: "Puerto Rico",
  PS: "Palestine", PT: "Portugal", PW: "Palau", PY: "Paraguay", QA: "Qatar",
  RO: "Romania", RS: "Serbia", RU: "Russia", RW: "Rwanda", SA: "Saudi Arabia",
  SB: "Solomon Is.", SC: "Seychelles", SD: "Sudan", SE: "Sweden", SG: "Singapore",
  SI: "Slovenia", SK: "Slovakia", SL: "Sierra Leone", SM: "San Marino", SN: "Senegal",
  SO: "Somalia", SR: "Suriname", SS: "South Sudan", ST: "São Tomé", SV: "El Salvador",
  SY: "Syria", SZ: "Eswatini", TD: "Chad", TG: "Togo", TH: "Thailand",
  TJ: "Tajikistan", TL: "Timor-Leste", TM: "Turkmenistan", TN: "Tunisia", TO: "Tonga",
  TR: "Turkey", TT: "Trinidad", TV: "Tuvalu", TW: "Taiwan", TZ: "Tanzania",
  UA: "Ukraine", UG: "Uganda", US: "USA", UY: "Uruguay", UZ: "Uzbekistan",
  VA: "Vatican", VC: "St. Vincent", VE: "Venezuela", VN: "Vietnam", VU: "Vanuatu",
  WS: "Samoa", XK: "Kosovo", YE: "Yemen", ZA: "South Africa", ZM: "Zambia", ZW: "Zimbabwe",
};

// Cities cache
let citiesCache: City[] | null = null;
let citiesLoadingPromise: Promise<City[]> | null = null;

async function loadCities(): Promise<City[]> {
  if (citiesCache) return citiesCache;

  if (citiesLoadingPromise) return citiesLoadingPromise;

  citiesLoadingPromise = fetch("/cities.json")
    .then((res) => res.json())
    .then((data: City[]) => {
      citiesCache = data;
      return data;
    });

  return citiesLoadingPromise;
}

// Simulated API call with delay
async function searchUsers(query: string): Promise<User[]> {
  // Simulate network delay (300-800ms)
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));

  if (!query.trim()) return [];

  const lower = query.toLowerCase();
  const results = USERS_DB.filter(
    (user) =>
      user.name.toLowerCase().includes(lower) ||
      user.email.toLowerCase().includes(lower) ||
      user.role.toLowerCase().includes(lower)
  );

  // If no exact matches, return some suggestions based on first letter or random
  if (results.length === 0) {
    const firstChar = lower[0];
    const suggestions = USERS_DB.filter((user) =>
      user.name.toLowerCase().startsWith(firstChar)
    ).slice(0, 5);

    if (suggestions.length > 0) return suggestions;

    // Return random 5 users as fallback
    return [...USERS_DB].sort(() => Math.random() - 0.5).slice(0, 5);
  }

  return results.slice(0, 10);
}

async function searchCities(query: string): Promise<(City & { id: number; countryName: string })[]> {
  const cities = await loadCities();

  // Additional simulated delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  if (!query.trim()) return [];

  const lower = query.toLowerCase();

  const results = cities
    .filter((city) => {
      const countryName = COUNTRY_NAMES[city.country] || city.country;
      return (
        city.name.toLowerCase().includes(lower) ||
        countryName.toLowerCase().includes(lower) ||
        city.country.toLowerCase() === lower
      );
    })
    .slice(0, 15)
    .map((city, index) => ({
      ...city,
      id: index,
      countryName: COUNTRY_NAMES[city.country] || city.country,
    }));

  // If no matches, return some random cities as suggestions
  if (results.length === 0) {
    return [...cities]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10)
      .map((city, index) => ({
        ...city,
        id: index,
        countryName: COUNTRY_NAMES[city.country] || city.country,
      }));
  }

  return results;
}

type CityResult = City & { id: number; countryName: string };

// Generic Autocomplete component with multi-select
function Autocomplete<T extends { id: number }>({
  placeholder,
  searchFn,
  renderOption,
  renderChip,
  getKey,
  debounceMs = 300,
  minChars = 1,
  label,
  selectedItems,
  onSelectedChange,
}: {
  placeholder: string;
  searchFn: (query: string) => Promise<T[]>;
  renderOption: (item: T, isHighlighted: boolean) => React.ReactNode;
  renderChip: (item: T) => string;
  getKey: (item: T) => string;
  debounceMs?: number;
  minChars?: number;
  label: string;
  selectedItems: T[];
  onSelectedChange: (items: T[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedKeys = new Set(selectedItems.map(getKey));

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
        // Filter out already selected items
        const filtered = searchResults.filter((item) => !selectedKeys.has(getKey(item)));
        setResults(filtered);
        setHighlightedIndex(-1);
      } finally {
        setIsLoading(false);
      }
    },
    [searchFn, minChars, selectedKeys, getKey]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, debounceMs);
  };

  const handleSelect = (item: T) => {
    onSelectedChange([...selectedItems, item]);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (item: T) => {
    onSelectedChange(selectedItems.filter((i) => getKey(i) !== getKey(item)));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && query === "" && selectedItems.length > 0) {
      // Remove last selected item
      onSelectedChange(selectedItems.slice(0, -1));
      return;
    }

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
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {/* Input with chips */}
      <div
        className={`flex flex-wrap gap-2 p-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 bg-white ${
          selectedItems.length > 0 ? "border-blue-300" : "border-gray-300"
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {selectedItems.map((item) => (
          <span
            key={getKey(item)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            {renderChip(item)}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(item);
              }}
              className="hover:bg-blue-200 rounded-full p-0.5"
              aria-label={`Remove ${renderChip(item)}`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.length >= minChars) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedItems.length === 0 ? placeholder : "Add more..."}
          className="flex-1 min-w-[120px] outline-none bg-transparent"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
        />
        {isLoading && (
          <div className="flex items-center">
            <div
              className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
              aria-label="Loading"
            />
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
                key={getKey(item)}
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
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedCities, setSelectedCities] = useState<CityResult[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [citiesLoaded, setCitiesLoaded] = useState(false);

  // Preload cities on mount
  useEffect(() => {
    loadCities().then(() => setCitiesLoaded(true));
  }, []);

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
          Test AI agent&apos;s ability to interact with typeahead search inputs with debounced API calls and multi-select.
        </p>

        <div className="grid gap-8">
          {/* User Search */}
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">1. User Search (Multi-select)</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Search for users by name, email, or role. Select multiple users. Press Backspace to remove the last selection.
            </p>

            <Autocomplete
              label="Search Users"
              placeholder="Type a name, email, or role..."
              searchFn={searchUsers}
              renderOption={(user, isHighlighted) => (
                <div className={`px-4 py-3 ${isHighlighted ? "bg-blue-100" : "hover:bg-gray-50"}`}>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">
                    {user.email} · {user.role}
                  </div>
                </div>
              )}
              renderChip={(user) => user.name}
              getKey={(user) => user.id.toString()}
              selectedItems={selectedUsers}
              onSelectedChange={(users) => {
                const added = users.filter((u) => !selectedUsers.find((s) => s.id === u.id));
                const removed = selectedUsers.filter((s) => !users.find((u) => u.id === s.id));

                added.forEach((u) => addLog(`Added user: ${u.name}`));
                removed.forEach((u) => addLog(`Removed user: ${u.name}`));

                setSelectedUsers(users);
              }}
            />

            {selectedUsers.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  Selected Users ({selectedUsers.length}):
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  {selectedUsers.map((user) => (
                    <div key={user.id}>
                      {user.name} - {user.role}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* City Search */}
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">2. City Search (Multi-select)</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Search from 100k+ real cities worldwide. Data loaded from{" "}
              <a
                href="https://github.com/lutangar/cities.json"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                cities.json
              </a>.
              {!citiesLoaded && (
                <span className="ml-2 text-orange-600">(Loading cities data...)</span>
              )}
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
                    <div className="text-sm text-gray-500">{city.countryName}</div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {city.lat.slice(0, 7)}, {city.lng.slice(0, 7)}
                  </div>
                </div>
              )}
              renderChip={(city) => `${city.name}, ${city.country}`}
              getKey={(city) => `${city.name}-${city.lat}-${city.lng}`}
              selectedItems={selectedCities}
              onSelectedChange={(cities) => {
                const added = cities.filter(
                  (c) => !selectedCities.find((s) => getKey(s) === getKey(c))
                );
                const removed = selectedCities.filter(
                  (s) => !cities.find((c) => getKey(c) === getKey(s))
                );

                function getKey(c: CityResult) {
                  return `${c.name}-${c.lat}-${c.lng}`;
                }

                added.forEach((c) => addLog(`Added city: ${c.name}, ${c.countryName}`));
                removed.forEach((c) => addLog(`Removed city: ${c.name}, ${c.countryName}`));

                setSelectedCities(cities);
              }}
            />

            {selectedCities.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  Selected Cities ({selectedCities.length}):
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  {selectedCities.map((city) => (
                    <div key={`${city.name}-${city.lat}-${city.lng}`}>
                      {city.name}, {city.countryName} ({city.lat}, {city.lng})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Test Scenarios */}
          <div className="p-6 border border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">3. Test Scenarios</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Try these searches:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><code className="bg-gray-100 px-1 rounded">eng</code> - finds multiple engineers</li>
                <li><code className="bg-gray-100 px-1 rounded">xyz</code> - returns suggestions even with no exact match</li>
                <li><code className="bg-gray-100 px-1 rounded">tokyo</code> - finds Tokyo, Japan</li>
                <li><code className="bg-gray-100 px-1 rounded">US</code> - finds cities in USA</li>
                <li>Select multiple items, then use Backspace to remove</li>
                <li>Click the × on chips to remove specific selections</li>
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
