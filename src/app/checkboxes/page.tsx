"use client";

import Link from "next/link";
import { useState } from "react";

export default function CheckboxesPage() {
  const [switchValue, setSwitchValue] = useState(false);
  const [singleCheckbox, setSingleCheckbox] = useState(false);
  const [singleOption, setSingleOption] = useState("");
  const [multipleOptions, setMultipleOptions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const singleOptions = ["Option A", "Option B", "Option C"];
  const multipleOptionsData = ["Feature 1", "Feature 2", "Feature 3", "Feature 4"];

  const handleSingleOptionChange = (option: string) => {
    setSingleOption(option);
  };

  const handleMultipleOptionChange = (option: string) => {
    setMultipleOptions(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setMultipleOptions([]);
    } else {
      setMultipleOptions([...multipleOptionsData]);
    }
    setSelectAll(!selectAll);
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Checkboxes Demo</h1>

        <div className="space-y-12">
          <div>
            <h2 className="text-xl font-semibold mb-4">Switch Toggle</h2>
            <div className="flex items-center space-x-3">
              {switchValue && (
                <span className="text-green-600">Switch is ON</span>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={switchValue}
                  onChange={(e) => setSwitchValue(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-sm text-gray-700">
                Toggle is {switchValue ? "ON" : "OFF"}
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Single Checkbox</h2>
            {singleCheckbox && (
              <div className="w-full p-3 bg-green-100 rounded mb-4">
                <span className="text-green-600">
                  Thanks for agreeing!
                </span>
                <a href="https://example.com/terms" className="text-blue-600 hover:underline ml-2">
                  Terms and Conditions
                </a>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="single"
                checked={singleCheckbox}
                onChange={(e) => setSingleCheckbox(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="single" className="text-sm text-gray-700">
                I agree to the terms and conditions
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Multiple Choice (Single Selection)</h2>
            <div className="space-y-2">
              {singleOptions.map((option) => (
                <div key={option} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={option}
                    name="singleChoice"
                    value={option}
                    checked={singleOption === option}
                    onChange={() => handleSingleOptionChange(option)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor={option} className="text-sm text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Multiple Selection with Select All</h2>

            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                  Select All
                </label>
              </div>
            </div>

            <div className="space-y-2 ml-6">
              {multipleOptionsData.map((option) => (
                <div key={option} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={option}
                    checked={multipleOptions.includes(option)}
                    onChange={() => handleMultipleOptionChange(option)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor={option} className="text-sm text-gray-700">
                    {option}
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded">
              <p className="text-sm text-gray-700">
                Selected: {multipleOptions.length > 0 ? multipleOptions.join(", ") : "None"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
