"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

declare var google: any;

interface Activity {
  title: string;
  time: string;
  location: string;
  coords: [number, number];
}

interface MapComponentProps {
  activities: Activity[];
  activeActivityIndex?: number | null;
}

// Dynamic script loader for Google Maps JavaScript SDK
const loadGoogleMapsScript = (apiKey: string, callback: () => void) => {
  if (typeof window === "undefined") return;

  if (typeof google !== "undefined" && google.maps) {
    callback();
    return;
  }

  const existingScript = document.getElementById("googleMapsScript");
  if (existingScript) {
    const handleLoad = () => callback();
    existingScript.addEventListener("load", handleLoad);
    return;
  }

  const script = document.createElement("script");
  // If API key is empty, it runs in standard developer sandbox mode (shows warning but renders perfectly)
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
  script.id = "googleMapsScript";
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);

  script.onload = () => {
    callback();
  };
};

export default function MapComponent({ activities, activeActivityIndex }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // Geolocation States
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const [apiReady, setApiReady] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    loadGoogleMapsScript(apiKey, () => {
      setApiReady(true);
    });
  }, []);

  // Initialize Map Once API is ready
  useEffect(() => {
    if (!apiReady || !mapContainerRef.current || mapRef.current) return;

    // Default center (Delhi, India coords)
    const initialCenter = { lat: 28.6139, lng: 77.2090 };
    const map = new google.maps.Map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      styles: [
        {
          featureType: "administrative",
          elementType: "geometry.stroke",
          stylers: [{ visibility: "on" }, { color: "#e2e8f0" }]
        },
        {
          featureType: "landscape",
          elementType: "geometry.fill",
          stylers: [{ color: "#f8fafc" }]
        },
        {
          featureType: "poi",
          elementType: "labels.text",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "water",
          elementType: "geometry.fill",
          stylers: [{ color: "#cbd5e1" }]
        }
      ]
    });

    mapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    // Auto-locate user on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserCoords(coords);
        },
        (err) => {
          console.warn("User geolocation denied on mount:", err.message);
        }
      );
    }
  }, [apiReady]);

  // Update User Location Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userCoords || !apiReady) return;

    const latLng = { lat: userCoords[0], lng: userCoords[1] };

    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(latLng);
    } else {
      const userMarker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: "You are here",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#10b981", // Emerald green
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }
      });
      userMarkerRef.current = userMarker;
    }
  }, [userCoords, apiReady]);

  // Update Itinerary Markers and Routing Path
  useEffect(() => {
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !apiReady) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Clear old polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (infoWindow) {
      infoWindow.close();
    }

    if (!activities || activities.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    const coordsList: google.maps.LatLngLiteral[] = [];

    // Draw new markers
    activities.forEach((act, idx) => {
      if (!act.coords || act.coords.length < 2) return;

      const markerLatLng = { lat: act.coords[0], lng: act.coords[1] };
      coordsList.push(markerLatLng);
      bounds.extend(markerLatLng);

      const isActive = activeActivityIndex === idx;

      // Custom circular numbered symbol marker matching colors
      const marker = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        label: {
          text: String(idx + 1),
          color: "white",
          fontSize: "11px",
          fontWeight: "bold"
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: isActive ? "#1e3a8a" : "#003580", // Blue color accents
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        title: act.title,
      });

      // Add click handler to marker infowindow
      marker.addListener("click", () => {
        if (infoWindow) {
          infoWindow.setContent(`
            <div style="padding: 8px; font-family: sans-serif; color: #1e293b;">
              <p style="margin: 0; font-size: 10px; font-weight: bold; color: #1e3a8a; text-transform: uppercase;">${act.time}</p>
              <h4 style="margin: 2px 0 0 0; font-size: 13px; font-weight: bold; color: #0f172a;">${act.title}</h4>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">${act.location}</p>
            </div>
          `);
          infoWindow.open(map, marker);
        }
      });

      if (isActive && infoWindow) {
        infoWindow.setContent(`
          <div style="padding: 8px; font-family: sans-serif; color: #1e293b;">
            <p style="margin: 0; font-size: 10px; font-weight: bold; color: #1e3a8a; text-transform: uppercase;">${act.time}</p>
            <h4 style="margin: 2px 0 0 0; font-size: 13px; font-weight: bold; color: #0f172a;">${act.title}</h4>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">${act.location}</p>
          </div>
        `);
        // Slight delay to ensure map panning does not cancel popup load
        setTimeout(() => infoWindow.open(map, marker), 100);
      }

      markersRef.current.push(marker);
    });

    // Draw route path connection polyline
    if (coordsList.length > 1) {
      const polyline = new google.maps.Polyline({
        path: coordsList,
        geodesic: true,
        strokeColor: "#003580",
        strokeOpacity: 0.8,
        strokeWeight: 3,
      });
      polyline.setMap(map);
      polylineRef.current = polyline;
    }

    // Fly camera bounds to fit markers
    if (coordsList.length > 0) {
      map.fitBounds(bounds);
      // Limit zoom levels to prevent excessive close-ups on single-stop plans
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 15) map.setZoom(15);
        google.maps.event.removeListener(listener);
      });
    }
  }, [activities, activeActivityIndex, apiReady]);

  // Locate User Button Handler
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
        setUserCoords(coords);
        if (mapRef.current) {
          mapRef.current.panTo({ lat: coords[0], lng: coords[1] });
          mapRef.current.setZoom(14);
        }
      },
      (err) => {
        alert(`Failed to retrieve location: ${err.message}`);
      }
    );
  };

  if (!apiReady) {
    return (
      <div className="w-full h-full min-h-[400px] bg-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-900" />
        <span className="text-xs font-semibold">Initializing Google Maps SDK...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Geolocation Button overlay */}
      <button 
        onClick={handleLocateUser} 
        className="absolute bottom-16 left-4 bg-white/95 hover:bg-white text-slate-800 font-bold px-3 py-2.5 rounded-xl border border-slate-200 shadow-lg z-[1000] flex items-center gap-2 text-xs hover:scale-105 hover:shadow-xl transition-all duration-150"
      >
        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
        Locate Me
      </button>
    </div>
  );
}
