"use client";

import Link from "next/link";
import { useState } from "react";

export default function ButtonsPage() {
  const [selectedButtons, setSelectedButtons] = useState<Set<string>>(new Set());

  const toggleButton = (buttonId: string) => {
    setSelectedButtons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(buttonId)) {
        newSet.delete(buttonId);
      } else {
        newSet.add(buttonId);
      }
      return newSet;
    });
  };

  const isSelected = (buttonId: string) => selectedButtons.has(buttonId);

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Buttons Demo</h1>

        <div className="space-y-12">
          {/* Price Selection Button */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Price Selection Button</h2>
            <button
              type="button"
              className={`${
                isSelected('price-button') 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-4 py-2 rounded transition-all duration-200`}
              onClick={() => toggleButton('price-button')}
            >
              <div
                className="animate-fade-in"
                data-cy="selectYourchoiceButton-0"
              >
                <div className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">
                      <span className="text-lg">
                        <span>11.74</span>
                        €<span className="text-sm">/kg</span>
                      </span>
                    </div>
                    <span className={`mx-1 ${isSelected('price-button') ? 'text-green-200' : 'text-gray-400'}`}>/</span>
                    <div className="font-semibold">
                      <span className="text-lg">
                        <span>140.84</span>
                        €
                      </span>
                    </div>
                  </div>
                </div>
                <span className="block text-center mt-2">
                  {isSelected('price-button') ? 'Selected' : 'Select'}
                </span>
              </div>
            </button>
          </section>

          {/* Icon Buttons */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Icon Buttons</h2>
            <div className="flex gap-4 flex-wrap">
              <button
                className={`p-4 rounded-lg transition-all duration-200 ${
                  isSelected('icon-home') 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => toggleButton('icon-home')}
              >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="block text-sm font-medium">
                  {isSelected('icon-home') ? 'Selected' : 'Home'}
                </span>
              </button>

              <button
                className={`p-4 rounded-lg transition-all duration-200 ${
                  isSelected('icon-settings') 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => toggleButton('icon-settings')}
              >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="block text-sm font-medium">
                  {isSelected('icon-settings') ? 'Selected' : 'Settings'}
                </span>
              </button>

              <button
                className={`p-4 rounded-lg transition-all duration-200 ${
                  isSelected('icon-user') 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => toggleButton('icon-user')}
              >
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="block text-sm font-medium">
                  {isSelected('icon-user') ? 'Selected' : 'Profile'}
                </span>
              </button>
            </div>
          </section>

          {/* Different Button Styles */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Different Button Styles</h2>
            <div className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <button
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    isSelected('pill-button') 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  onClick={() => toggleButton('pill-button')}
                >
                  {isSelected('pill-button') ? 'Selected' : 'Pill Button'}
                </button>

                <button
                  className={`px-6 py-3 border-2 rounded transition-all duration-200 ${
                    isSelected('outline-button') 
                      ? 'border-green-600 text-green-600 bg-green-50 hover:bg-green-100' 
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={() => toggleButton('outline-button')}
                >
                  {isSelected('outline-button') ? 'Selected' : 'Outline Button'}
                </button>

                <button
                  className={`px-6 py-3 font-medium transition-all duration-200 ${
                    isSelected('ghost-button') 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-700 hover:bg-gray-100'
                  } rounded`}
                  onClick={() => toggleButton('ghost-button')}
                >
                  {isSelected('ghost-button') ? 'Selected' : 'Ghost Button'}
                </button>
              </div>
            </div>
          </section>

          {/* Disabled Button Example */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Disabled Button</h2>
            <button
              disabled
              className="px-6 py-3 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
            >
              Disabled Button
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}