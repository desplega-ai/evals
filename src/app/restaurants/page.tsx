"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl/mapbox";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  lat: number;
  lng: number;
  address: string;
}

const NYC_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Balthazar",
    cuisine: "French Bistro",
    lat: 40.7223,
    lng: -74.0033,
    address: "80 Spring St, New York, NY 10012",
  },
  {
    id: "2",
    name: "Shake Shack",
    cuisine: "Burgers",
    lat: 40.7505,
    lng: -73.9972,
    address: "Madison Square Park, New York, NY",
  },
  {
    id: "3",
    name: "Joe's Pizza",
    cuisine: "Pizza",
    lat: 40.7297,
    lng: -74.0034,
    address: "7 Carmine St, New York, NY 10014",
  },
  {
    id: "4",
    name: "Llili",
    cuisine: "Italian",
    lat: 40.7236,
    lng: -74.0009,
    address: "221 West Houston St, New York, NY 10014",
  },
  {
    id: "5",
    name: "The Smith",
    cuisine: "American",
    lat: 40.7385,
    lng: -73.9885,
    address: "956 Second Ave, New York, NY 10022",
  },
  {
    id: "6",
    name: "Gramercy Tavern",
    cuisine: "American Tavern",
    lat: 40.7376,
    lng: -73.9882,
    address: "42 E 20th St, New York, NY 10003",
  },
  {
    id: "7",
    name: "Carbone",
    cuisine: "Italian",
    lat: 40.7293,
    lng: -74.0047,
    address: "181 Thompson St, New York, NY 10012",
  },
  {
    id: "8",
    name: "Eleven Madison Park",
    cuisine: "Fine Dining",
    lat: 40.7376,
    lng: -73.9865,
    address: "11 Madison Ave, New York, NY 10010",
  },
  {
    id: "9",
    name: "Per Se",
    cuisine: "French Fine Dining",
    lat: 40.7732,
    lng: -73.9822,
    address: "10 Columbus Cir, New York, NY 10019",
  },
  {
    id: "10",
    name: "Katz's Delicatessen",
    cuisine: "Deli",
    lat: 40.7157,
    lng: -73.9876,
    address: "205 E Houston St, New York, NY 10002",
  },
];

const MAPBOX_TOKEN =
  "pk.eyJ1IjoidGFyYXMtZGVzcGxlZ2EiLCJhIjoiY21oejdib3htMGkwYzJsczV6MDRjeTZiMSJ9.6EgC8pSRXVR7mpLyLil42A";

const DEFAULT_VIEW = {
  longitude: -74.006,
  latitude: 40.7128,
  zoom: 12,
};

export default function RestaurantsPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(
    null
  );
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(true);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    console.log("🍽️ RestaurantsPage mounted");
    console.log("📍 Mapbox token loaded:", MAPBOX_TOKEN.substring(0, 20) + "...");
  }, []);

  const handleRestaurantSelect = (restaurantId: string) => {
    console.log("📍 Restaurant selected:", restaurantId);
    setSelectedRestaurant(restaurantId);
  };

  const handleRestaurantDeselect = () => {
    console.log("🔄 Resetting view to center");
    setSelectedRestaurant(null);
    // Reset map to center
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [DEFAULT_VIEW.longitude, DEFAULT_VIEW.latitude],
        zoom: DEFAULT_VIEW.zoom,
        duration: 1000,
      });
    }
  };

  return (
    <div className="font-sans h-screen w-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-4 bg-white border-b border-gray-300 flex justify-between items-center">
        <div>
          <Link href="/" className="text-blue-600 hover:underline text-sm" aria-label="Back to home page">
            ← Back to Home
          </Link>
          <h1 className="text-2xl font-bold mt-2">NYC Restaurants Map</h1>
        </div>
        <div className="text-right" role="status" aria-live="polite">
          {error && <p className="text-red-600 text-sm" aria-label={`Error: ${error}`}>❌ {error}</p>}
          {!mapLoaded && <p className="text-gray-500 text-sm" aria-label="Map is loading">⏳ Loading map...</p>}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative bg-gray-100" role="region" aria-label="Interactive map showing NYC restaurants">
          <Map
            ref={mapRef}
            initialViewState={DEFAULT_VIEW}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            onLoad={() => {
              console.log("✅ Map loaded successfully");
              setMapLoaded(true);
            }}
            onError={(e) => {
              console.error("❌ Map error:", e);
              setError(e?.error?.message || "Failed to load map");
            }}
          >
            {NYC_RESTAURANTS.map((restaurant) => (
              <Marker
                key={restaurant.id}
                longitude={restaurant.lng}
                latitude={restaurant.lat}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  console.log("📍 Marker clicked:", restaurant.name);
                  handleRestaurantSelect(restaurant.id);
                }}
              >
                <button
                  className={`w-8 h-8 rounded-full shadow-lg cursor-pointer transition-all ${
                    selectedRestaurant === restaurant.id
                      ? "bg-green-600 border-2 border-white scale-125"
                      : "bg-red-600 border-2 border-white hover:bg-red-700"
                  }`}
                  aria-label={`Select ${restaurant.name} restaurant`}
                  aria-pressed={selectedRestaurant === restaurant.id}
                  data-testid={`restaurant-marker-${restaurant.id}`}
                  data-restaurant-name={restaurant.name}
                />
              </Marker>
            ))}

            {selectedRestaurant && (
              <Popup
                longitude={
                  NYC_RESTAURANTS.find((r) => r.id === selectedRestaurant)?.lng ||
                  0
                }
                latitude={
                  NYC_RESTAURANTS.find((r) => r.id === selectedRestaurant)?.lat ||
                  0
                }
                onClose={() => {
                  console.log("🔴 Popup closed");
                  handleRestaurantDeselect();
                }}
                closeButton={true}
                closeOnClick={false}
              >
                {(() => {
                  const restaurant = NYC_RESTAURANTS.find(
                    (r) => r.id === selectedRestaurant
                  );
                  return restaurant ? (
                    <div className="p-3">
                      <h3 className="font-bold text-lg mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-gray-700 mb-2">
                        {restaurant.cuisine}
                      </p>
                      <p className="text-sm text-gray-600">{restaurant.address}</p>
                    </div>
                  ) : null;
                })()}
              </Popup>
            )}
          </Map>
        </div>

        {/* Sidebar with restaurant list */}
        <aside
          className={`bg-white border-l border-gray-300 overflow-hidden transition-all duration-300 flex flex-col ${
            showList ? "w-80" : "w-0"
          }`}
          aria-label="Restaurant list sidebar"
          aria-hidden={!showList}
        >
          {/* Toggle button and header */}
          <div className="p-4 border-b border-gray-300 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Restaurants</h2>
            <button
              onClick={() => setShowList(!showList)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={showList ? "Close restaurant list sidebar" : "Open restaurant list sidebar"}
              aria-expanded={showList}
              aria-controls="restaurant-list"
              data-testid="sidebar-toggle-button"
            >
              {showList ? "✕" : "☰"}
            </button>
          </div>

          {/* Restaurant list */}
          <div className="flex-1 overflow-y-auto" id="restaurant-list" role="region" aria-label="List of restaurants">
            <div className="p-4 space-y-2">
              {NYC_RESTAURANTS.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => {
                    console.log("📋 Restaurant clicked:", restaurant.name);
                    if (selectedRestaurant === restaurant.id) {
                      handleRestaurantDeselect();
                    } else {
                      handleRestaurantSelect(restaurant.id);
                    }
                  }}
                  className={`w-full p-3 text-left border rounded-lg transition-colors ${
                    selectedRestaurant === restaurant.id
                      ? "border-green-600 bg-green-50 shadow-md"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                  aria-label={`${restaurant.name}, ${restaurant.cuisine}, located at ${restaurant.address}`}
                  aria-pressed={selectedRestaurant === restaurant.id}
                  data-testid={`restaurant-item-${restaurant.id}`}
                  data-restaurant-id={restaurant.id}
                  data-restaurant-name={restaurant.name}
                >
                  <h3 className="font-medium text-sm">{restaurant.name}</h3>
                  <p className="text-xs text-gray-600">{restaurant.cuisine}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {restaurant.address}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Toggle button when list is hidden */}
        {!showList && (
          <button
            onClick={() => setShowList(true)}
            className="absolute right-0 top-20 bg-blue-600 text-white px-2 py-4 rounded-l-lg hover:bg-blue-700 transition-colors shadow-lg"
            aria-label="Open restaurant list sidebar"
            aria-expanded={showList}
            data-testid="sidebar-toggle-button-floating"
          >
            ☰
          </button>
        )}
      </div>
    </div>
  );
}
