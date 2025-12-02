"use client";

import Link from "next/link";
import { useState } from "react";

export default function SlidersPage() {
  const [basicValue, setBasicValue] = useState(50);
  const [stepValue, setStepValue] = useState(50);
  const [minMaxValue, setMinMaxValue] = useState([25, 75]);
  const [verticalValue, setVerticalValue] = useState(60);
  const [volumeValue, setVolumeValue] = useState(70);
  const [temperatureValue, setTemperatureValue] = useState(20);
  const [brightnessValue, setBrightnessValue] = useState(80);
  const [priceValue, setPriceValue] = useState(5000);

  const handleMinMaxChange = (index: number, value: number) => {
    const newValues = [...minMaxValue];
    newValues[index] = value;
    // Ensure min doesn't exceed max and vice versa
    if (index === 0 && value > minMaxValue[1]) {
      newValues[1] = value;
    } else if (index === 1 && value < minMaxValue[0]) {
      newValues[0] = value;
    }
    setMinMaxValue(newValues);
  };

  const getVolumeIcon = () => {
    if (volumeValue === 0) return "🔇";
    if (volumeValue < 33) return "🔈";
    if (volumeValue < 66) return "🔉";
    return "🔊";
  };

  const getTemperatureColor = () => {
    if (temperatureValue < 10) return "from-blue-500 to-blue-300";
    if (temperatureValue < 20) return "from-cyan-500 to-blue-300";
    if (temperatureValue < 30) return "from-yellow-500 to-orange-300";
    return "from-red-500 to-orange-300";
  };

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

        <h1 className="text-3xl font-bold mb-8">Sliders Demo</h1>

        <div className="space-y-12">
          {/* Basic Range Slider */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Basic Range Slider</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={basicValue}
                  onChange={(e) => setBasicValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <span className="text-lg font-medium min-w-[60px] text-right">
                  {basicValue}%
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${basicValue}%` }}
                />
              </div>
            </div>
          </section>

          {/* Step Slider */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Step Slider (Increments of 10)</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={stepValue}
                  onChange={(e) => setStepValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <span className="text-lg font-medium min-w-[60px] text-right">
                  {stepValue}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((mark) => (
                  <span key={mark} className="w-8 text-center">
                    {mark}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Multi-Range Slider */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Multi-Range Slider (Min/Max)</h2>
            <div className="space-y-4">
              <div className="relative h-12 flex items-center">
                <div className="absolute w-full h-2 bg-gray-200 rounded-lg pointer-events-none">
                  <div
                    className="absolute h-full bg-green-500 rounded-lg"
                    style={{
                      left: `${minMaxValue[0]}%`,
                      width: `${minMaxValue[1] - minMaxValue[0]}%`,
                    }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minMaxValue[0]}
                  onChange={(e) => handleMinMaxChange(0, Number(e.target.value))}
                  className="absolute w-full appearance-none bg-transparent cursor-pointer multi-range-slider"
                  style={{ zIndex: minMaxValue[0] > 50 ? 5 : 3 }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minMaxValue[1]}
                  onChange={(e) => handleMinMaxChange(1, Number(e.target.value))}
                  className="absolute w-full appearance-none bg-transparent cursor-pointer multi-range-slider"
                  style={{ zIndex: minMaxValue[1] <= 50 ? 5 : 3 }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Min: <span className="text-green-600 text-lg">{minMaxValue[0]}</span>
                </span>
                <span className="text-sm text-gray-600">
                  Range: <span className="font-semibold text-green-600">{minMaxValue[1] - minMaxValue[0]}</span>
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Max: <span className="text-green-600 text-lg">{minMaxValue[1]}</span>
                </span>
              </div>
            </div>
          </section>

          {/* Price Range Slider */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Price Range Slider</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 min-w-[60px]">$0</span>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceValue}
                  onChange={(e) => setPriceValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <span className="text-sm text-gray-600 min-w-[60px]">$10,000</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-600">
                  ${priceValue.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

          {/* Volume Slider with Icon */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Volume Slider</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl min-w-[40px]">{getVolumeIcon()}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeValue}
                  onChange={(e) => setVolumeValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <span className="text-lg font-medium min-w-[60px] text-right">
                  {volumeValue}%
                </span>
              </div>
            </div>
          </section>

          {/* Temperature Slider with Gradient */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Temperature Slider</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl min-w-[40px]">🌡️</span>
                <div className="w-full relative">
                  <div className={`h-3 rounded-lg bg-gradient-to-r ${getTemperatureColor()}`} />
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={temperatureValue}
                    onChange={(e) => setTemperatureValue(Number(e.target.value))}
                    className="absolute top-0 w-full h-3 bg-transparent appearance-none cursor-pointer slider-thumb-temp"
                    style={{ margin: 0 }}
                  />
                </div>
                <span className="text-lg font-medium min-w-[60px] text-right">
                  {temperatureValue}°C
                </span>
              </div>
            </div>
          </section>

          {/* Brightness Slider */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Brightness Slider</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl min-w-[40px]">💡</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightnessValue}
                  onChange={(e) => setBrightnessValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <span className="text-lg font-medium min-w-[60px] text-right">
                  {brightnessValue}%
                </span>
              </div>
              <div
                className="h-20 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: `rgba(255, 255, 0, ${brightnessValue / 100})`,
                  border: '2px solid #e5e7eb'
                }}
              />
            </div>
          </section>

          {/* Vertical Slider */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Vertical Slider</h2>
            <div className="flex items-start gap-8">
              <div className="flex flex-col items-center gap-4">
                <span className="text-lg font-medium">{verticalValue}%</span>
                <div className="h-64 flex items-center justify-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={verticalValue}
                    onChange={(e) => setVerticalValue(Number(e.target.value))}
                    className="w-64 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-vertical"
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center'
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600">Level</span>
              </div>
              <div className="flex flex-col justify-end h-64 w-16 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="w-full bg-purple-500 transition-all duration-200"
                  style={{ height: `${verticalValue}%` }}
                />
              </div>
            </div>
          </section>

          {/* Disabled Slider */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Disabled Slider</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={50}
                  disabled
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed opacity-50"
                />
                <span className="text-lg font-medium min-w-[60px] text-right text-gray-400">
                  50%
                </span>
              </div>
              <p className="text-sm text-gray-500">This slider is disabled and cannot be interacted with.</p>
            </div>
          </section>
        </div>

        <style jsx>{`
          input[type="range"].slider-thumb::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          input[type="range"].slider-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          input[type="range"].multi-range-slider::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #22c55e;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            pointer-events: all;
            position: relative;
          }

          input[type="range"].multi-range-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #22c55e;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            pointer-events: all;
          }

          input[type="range"].multi-range-slider::-webkit-slider-runnable-track {
            background: transparent;
            height: 2px;
          }

          input[type="range"].multi-range-slider::-moz-range-track {
            background: transparent;
            height: 2px;
          }

          input[type="range"].slider-thumb-temp::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: 3px solid #333;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }

          input[type="range"].slider-thumb-temp::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            border: 3px solid #333;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          }

          input[type="range"].slider-thumb-vertical::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #9333ea;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          input[type="range"].slider-thumb-vertical::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #9333ea;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </main>
    </div>
  );
}
