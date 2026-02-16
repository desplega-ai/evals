"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChallengeCard } from "./challenge-card";
import { SPEEDRUN_CITIES } from "./data";
import type { SpeedrunCity } from "./data";
import type { ChallengeWrapperProps } from "./types";

export function WizardChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [cookiesError, setCookiesError] = useState("");
  const [selectedCity, setSelectedCity] = useState<SpeedrunCity | null>(null);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<SpeedrunCity[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityHighlight, setCityHighlight] = useState(-1);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const phonePattern = /^(\+?\d{10,15}|\(\d{3}\)\s?\d{3}-?\d{4})$/;
  const hasValidPhone = phonePattern.test(phone.trim());

  useEffect(() => {
    if (!challenge.completed && hasSubmitted) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmitted, onComplete]);

  const searchCities = useCallback((query: string) => {
    if (cityDebounceRef.current) clearTimeout(cityDebounceRef.current);
    cityDebounceRef.current = setTimeout(() => {
      if (!query.trim()) {
        setCityResults([]);
        return;
      }
      const lower = query.toLowerCase();
      const filtered = SPEEDRUN_CITIES.filter(
        (c) => c.name.toLowerCase().includes(lower) || c.country.toLowerCase().includes(lower)
      );
      const sliced = filtered.slice(0, 5);
      setCityResults(sliced);
      setCityHighlight(sliced.length > 0 ? 0 : -1);
    }, 300);
  }, []);

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCityQuery(e.target.value);
    setShowCityDropdown(true);
    searchCities(e.target.value);
  };

  const selectCity = (city: SpeedrunCity) => {
    setSelectedCity(city);
    setCityQuery("");
    setCityResults([]);
    setShowCityDropdown(false);
  };

  const handleCityKeyDown = (e: React.KeyboardEvent) => {
    if (!showCityDropdown || cityResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCityHighlight((prev) => (prev < cityResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCityHighlight((prev) => (prev > 0 ? prev - 1 : cityResults.length - 1));
    } else if (e.key === "Enter" && cityHighlight >= 0) {
      e.preventDefault();
      selectCity(cityResults[cityHighlight]);
    } else if (e.key === "Escape") {
      setShowCityDropdown(false);
    }
  };

  const handleNextFromStep1 = () => {
    let valid = true;
    if (!hasValidPhone) {
      setPhoneError("Enter a valid phone number (e.g. +1234567890 or (123) 456-7890)");
      valid = false;
    } else {
      setPhoneError("");
    }
    if (!cookiesAccepted) {
      setCookiesError("You must accept cookies to proceed");
      valid = false;
    } else {
      setCookiesError("");
    }
    if (valid) setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (selectedCity) setStep(3);
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
  };

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Enter a valid phone number", completed: hasValidPhone },
        { text: "Accept cookies", completed: cookiesAccepted },
        { text: "Select a city", completed: selectedCity !== null },
        { text: "Submit the form", completed: hasSubmitted },
      ]}
    >
      <div className="space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                s < step ? "bg-green-500 text-white"
                  : s === step ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}>
                {s < step ? "✓" : s}
              </div>
              {s < 3 && (
                <div className={`w-8 h-0.5 ${s < step ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
          <span className="text-xs text-gray-500 ml-2">Step {step} of 3</span>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError(""); }}
                placeholder="+1234567890"
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  phoneError ? "border-red-400 bg-red-50" : "border-gray-300"
                }`}
              />
              {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={cookiesAccepted}
                  onChange={(e) => { setCookiesAccepted(e.target.checked); setCookiesError(""); }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                Accept cookies
              </label>
              {cookiesError && <p className="mt-1 text-xs text-red-600">{cookiesError}</p>}
            </div>

            <button
              onClick={handleNextFromStep1}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select a City</label>
              {selectedCity ? (
                <div className="flex items-center justify-between p-2 bg-green-50 border border-green-300 rounded-lg">
                  <span className="text-sm font-medium text-green-700">
                    {selectedCity.name}, {selectedCity.country}
                  </span>
                  <button
                    onClick={() => setSelectedCity(null)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={cityInputRef}
                    type="text"
                    value={cityQuery}
                    onChange={handleCityInputChange}
                    onFocus={() => cityQuery && setShowCityDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                    onKeyDown={handleCityKeyDown}
                    placeholder="Type a city or country..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {showCityDropdown && cityResults.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-auto">
                      {cityResults.map((city, idx) => (
                        <li
                          key={city.id}
                          onMouseDown={() => selectCity(city)}
                          onMouseEnter={() => setCityHighlight(idx)}
                          className={`px-3 py-2 cursor-pointer text-sm ${
                            idx === cityHighlight ? "bg-blue-100" : "hover:bg-gray-50"
                          }`}
                        >
                          <span className="font-medium">{city.name}</span>
                          <span className="text-gray-500">, {city.country}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleNextFromStep2}
                disabled={!selectedCity}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  selectedCity
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 text-sm">
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>Cookies:</strong> {cookiesAccepted ? "Accepted ✓" : "Not accepted"}</p>
              <p><strong>City:</strong> {selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : "—"}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
              >
                Submit ✓
              </button>
            </div>
          </div>
        )}
      </div>
    </ChallengeCard>
  );
}
