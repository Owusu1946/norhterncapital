"use client";

import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '500px'
};

// Northern Capital Hotel location in Savelugu, Tamale
const hotelLocation = {
  lat: 9.6412, // Approximate coordinates for Savelugu
  lng: -0.8270
};

interface GoogleMapWithDirectionsProps {
  className?: string;
}

export function GoogleMapWithDirections({ className = "" }: GoogleMapWithDirectionsProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [travelInfo, setTravelInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const directionsCallback = useCallback((response: any) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirections(response);
        const route = response.routes[0].legs[0];
        setTravelInfo({
          distance: route.distance?.text || '',
          duration: route.duration?.text || ''
        });
        setError(null);
      } else {
        console.error('Directions request failed due to ' + response.status);
        setError('Could not calculate directions. Please try again.');
      }
    }
  }, []);

  const getUserLocation = () => {
    setIsGettingLocation(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
          setIsGettingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setIsGettingLocation(false);
    }
  };

  const clearDirections = () => {
    setDirections(null);
    setUserLocation(null);
    setTravelInfo(null);
    setError(null);
  };

  return (
    <div className={className}>
      <LoadScript 
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        onLoad={() => setIsLoaded(true)}
      >
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={getUserLocation}
              disabled={isGettingLocation}
              className="flex items-center gap-2 rounded-2xl bg-[#01a4ff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0084cc] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Navigation className="h-4 w-4" />
              {isGettingLocation ? 'Getting Location...' : 'Get Directions from My Location'}
            </button>
            
            {directions && (
              <button
                onClick={clearDirections}
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50"
              >
                Clear Directions
              </button>
            )}
          </div>

          {/* Travel Info */}
          {travelInfo && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                  <Route className="h-5 w-5 text-[#01a4ff]" />
                </div>
                <div>
                  <p className="text-xs text-black/60">Distance</p>
                  <p className="font-semibold text-black">{travelInfo.distance}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                  <Clock className="h-5 w-5 text-[#01a4ff]" />
                </div>
                <div>
                  <p className="text-xs text-black/60">Estimated Time</p>
                  <p className="font-semibold text-black">{travelInfo.duration}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Map */}
          <div className="overflow-hidden rounded-3xl border border-black/5 shadow-lg">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={hotelLocation}
              zoom={userLocation ? 12 : 14}
              options={{
                zoomControl: true,
                streetViewControl: true,
                mapTypeControl: true,
                fullscreenControl: true,
              }}
            >
              {/* Hotel Marker */}
              <Marker
                position={hotelLocation}
                title="Northern Capital Hotel"
                icon={isLoaded ? {
                  url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwMWE0ZmYiLz4KPHBhdGggZD0iTTIwIDEwQzE1LjU4MTcgMTAgMTIgMTMuNTgxNyAxMiAxOEMxMiAyMy40MTgzIDE4IDMwIDIwIDMwQzIyIDMwIDI4IDIzLjQxODMgMjggMThDMjggMTMuNTgxNyAyNC40MTgzIDEwIDIwIDEwWk0yMCAyMUMyMC44Mjg0IDIxIDIxLjUgMjAuMzI4NCAyMS41IDE5LjVDMjEuNSAxOC42NzE2IDIwLjgyODQgMTggMjAgMThDMTkuMTcxNiAxOCAxOC41IDE4LjY3MTYgMTguNSAxOS41QzE4LjUgMjAuMzI4NCAxOS4xNzE2IDIxIDIwIDIxWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
                  scaledSize: new google.maps.Size(40, 40),
                } : undefined}
              />

              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  title="Your Location"
                  icon={isLoaded ? {
                    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiM0Mjg1RjQiLz4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
                    scaledSize: new google.maps.Size(30, 30),
                  } : undefined}
                />
              )}

              {/* Directions Service */}
              {userLocation && !directions && isLoaded && (
                <DirectionsService
                  options={{
                    destination: hotelLocation,
                    origin: userLocation,
                    travelMode: 'DRIVING' as any,
                  }}
                  callback={directionsCallback}
                />
              )}

              {/* Directions Renderer */}
              {directions && (
                <DirectionsRenderer
                  options={{
                    directions: directions,
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#01a4ff',
                      strokeWeight: 5,
                      strokeOpacity: 0.8,
                    },
                  }}
                />
              )}
            </GoogleMap>
          </div>

          {/* Hotel Info Card */}
          <div className="rounded-2xl border border-black/5 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#01a4ff]/10">
                <MapPin className="h-5 w-5 text-[#01a4ff]" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Northern Capital Hotel</h3>
                <p className="mt-1 text-sm text-black/70">
                  123 Central Business District<br />
                  Savelugu, Northern Region, Ghana
                </p>
                <p className="mt-2 text-xs text-black/60">
                  📍 5 minutes from Tamale International Airport
                </p>
              </div>
            </div>
          </div>
        </div>
      </LoadScript>
    </div>
  );
}
