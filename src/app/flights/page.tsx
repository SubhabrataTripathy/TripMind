"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Plane, ArrowLeft, Search, Filter, Sliders, ChevronDown, 
  ArrowLeftRight, Clock, ShieldCheck, Sparkles, Heart,
  MapPin, Calendar
} from "lucide-react";

export default function FlightsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><div className="w-8 h-8 animate-spin border-4 border-blue-900 rounded-full" /></div>}>
      <FlightsPage />
    </Suspense>
  );
}

function FlightsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL Pre-fills
  const initialDest = searchParams.get("destination") || "Goa (GOI)";
  const initialOrigin = searchParams.get("origin") || "Delhi (DEL)";

  // Search Fields state
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDest);
  const [tripType, setTripType] = useState("Round-trip");
  const [cabinClass, setCabinClass] = useState("Economy");
  const [travelers, setTravelers] = useState(1);

  // Filters State
  const [stopsFilter, setStopsFilter] = useState<string>("all"); // "all", "direct", "1stop"
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [airlineFilter, setAirlineFilter] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(35000);
  const [activeTab, setActiveTab] = useState<"cheapest" | "best" | "quickest">("cheapest");

  // Success Booking Modal State
  const [bookedFlight, setBookedFlight] = useState<any | null>(null);

  // Raw flights list database (Rupee ₹ pricing aligned to Indian markets)
  const allFlights = useMemo(() => [
    { id: 1, airline: "IndiGo", logo: "bg-blue-600 text-white font-bold", departs: "06:15 AM", arrives: "08:45 AM", duration: "2h 30m", stops: "Direct", price: 5400, type: "cheapest" },
    { id: 2, airline: "Air India", logo: "bg-red-600 text-white font-bold", departs: "09:30 AM", arrives: "12:15 PM", duration: "2h 45m", stops: "Direct", price: 6800, type: "best" },
    { id: 3, airline: "Vistara", logo: "bg-purple-800 text-white font-bold", departs: "02:15 PM", arrives: "04:45 PM", duration: "2h 30m", stops: "Direct", price: 7200, type: "best" },
    { id: 4, airline: "SpiceJet", logo: "bg-yellow-500 text-white font-bold", departs: "05:40 AM", arrives: "09:10 AM", duration: "3h 30m", stops: "1 Stop", price: 4900, type: "cheapest" },
    { id: 5, airline: "Akasa Air", logo: "bg-orange-500 text-white font-bold", departs: "08:00 PM", arrives: "10:30 PM", duration: "2h 30m", stops: "Direct", price: 5100, type: "cheapest" },
    { id: 6, airline: "IndiGo", logo: "bg-blue-600 text-white font-bold", departs: "11:45 AM", arrives: "02:20 PM", duration: "2h 35m", stops: "Direct", price: 5800, type: "cheapest" },
    { id: 7, airline: "Air India", logo: "bg-red-600 text-white font-bold", departs: "04:30 PM", arrives: "09:45 PM", duration: "5h 15m", stops: "1 Stop", price: 8200, type: "quickest" },
    { id: 8, airline: "Vistara", logo: "bg-purple-800 text-white font-bold", departs: "07:30 AM", arrives: "10:00 AM", duration: "2h 30m", stops: "Direct", price: 9100, type: "quickest" }
  ], []);

  // Filter flights dynamically in real-time
  const filteredFlights = useMemo(() => {
    let list = [...allFlights];

    // Filter by stops
    if (stopsFilter === "direct") {
      list = list.filter(f => f.stops === "Direct");
    } else if (stopsFilter === "1stop") {
      list = list.filter(f => f.stops === "1 Stop");
    }

    // Filter by Airline
    if (airlineFilter.length > 0) {
      list = list.filter(f => airlineFilter.includes(f.airline));
    }

    // Filter by Price
    list = list.filter(f => f.price <= priceMax);

    // Sort by Active Tab
    if (activeTab === "cheapest") {
      list.sort((a, b) => a.price - b.price);
    } else if (activeTab === "quickest") {
      list.sort((a, b) => {
        const minA = parseInt(a.duration.split("h")[0]) * 60 + parseInt(a.duration.split(" ")[1] || "0");
        const minB = parseInt(b.duration.split("h")[0]) * 60 + parseInt(b.duration.split(" ")[1] || "0");
        return minA - minB;
      });
    }

    return list;
  }, [allFlights, stopsFilter, airlineFilter, priceMax, activeTab]);

  const handleAirlineToggle = (name: string) => {
    if (airlineFilter.includes(name)) {
      setAirlineFilter(airlineFilter.filter(item => item !== name));
    } else {
      setAirlineFilter([...airlineFilter, name]);
    }
  };

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleBook = (flight: any) => {
    setBookedFlight(flight);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      
      {/* NAVBAR */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-[1000]">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-blue-900 font-bold text-sm hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-7.5 h-7.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-600/10 text-white">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-lg text-slate-900">
              Trip<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">Mind</span> <span className="text-slate-450 font-normal">Flights</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Kayak Engine Enabled
          </span>
        </div>
      </header>

      {/* SUB-HEADER SEARCH PANEL (Replicating Kayak Search Card) */}
      <section className="bg-[#0f172a] text-white px-6 py-8 shadow-inner">
        <div className="max-w-6xl mx-auto space-y-4">
          
          {/* Row 1: Configurations */}
          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-350">
            <div className="relative group cursor-pointer hover:text-white flex items-center gap-1">
              <span>{tripType}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            <div className="relative group cursor-pointer hover:text-white flex items-center gap-1">
              <span>{travelers} Traveler</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            <div className="relative group cursor-pointer hover:text-white flex items-center gap-1">
              <span>{cabinClass}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Row 2: Search Input row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
            {/* Origin */}
            <div className="lg:col-span-3 bg-white text-slate-850 px-4 py-2.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.015)] focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <Plane className="w-4 h-4 text-slate-400 rotate-45" />
              <input 
                type="text" 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value)}
                className="bg-transparent font-bold outline-none text-sm w-full"
                placeholder="From?" 
              />
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center">
              <button 
                onClick={handleSwapLocations}
                type="button" 
                className="bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white p-2.5 rounded-full border border-slate-700 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Destination */}
            <div className="lg:col-span-3 bg-white text-slate-850 px-4 py-2.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.015)] focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
              <MapPin className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent font-bold outline-none text-sm w-full"
                placeholder="To?" 
              />
            </div>

            {/* Dates */}
            <div className="lg:col-span-3 bg-white text-slate-850 px-4 py-2.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.015)]">
              <Calendar className="w-4 h-4 text-slate-450" />
              <div className="text-xs font-bold">
                <span className="block text-[8px] text-slate-400 uppercase tracking-wider leading-none">Departure / Return</span>
                <span className="block mt-0.5 text-slate-750">28 Jun - 03 Jul</span>
              </div>
            </div>

            {/* Search Trigger */}
            <button className="lg:col-span-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-lg flex items-center justify-center gap-2 transition px-6 py-2.5 text-sm shadow-md shadow-orange-500/10 active:scale-[0.98] cursor-pointer">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

        </div>
      </section>

      {/* MAIN LAYOUT: Filters + Results */}
      <section className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* LEFT SIDEBAR: Filters */}
        <aside className={`${showFiltersMobile ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0 space-y-6`}>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-orange-500" />
                Filter Flights
              </h3>
              <button 
                onClick={() => { setStopsFilter("all"); setAirlineFilter([]); setPriceMax(35000); }}
                className="text-[10px] text-blue-600 hover:underline font-bold"
              >
                Clear all
              </button>
            </div>

            {/* Stops */}
            <div>
              <p className="font-extrabold text-slate-850 text-xs uppercase tracking-wider mb-2">Stops</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input 
                    type="radio" 
                    name="stops" 
                    checked={stopsFilter === "all"}
                    onChange={() => setStopsFilter("all")}
                    className="accent-orange-500" 
                  />
                  <span>All flights</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input 
                    type="radio" 
                    name="stops" 
                    checked={stopsFilter === "direct"}
                    onChange={() => setStopsFilter("direct")}
                    className="accent-orange-500" 
                  />
                  <span>Direct only</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input 
                    type="radio" 
                    name="stops" 
                    checked={stopsFilter === "1stop"}
                    onChange={() => setStopsFilter("1stop")}
                    className="accent-orange-500" 
                  />
                  <span>1 stop max</span>
                </label>
              </div>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-extrabold text-slate-850 text-xs uppercase tracking-wider">Max Price</p>
                <span className="text-xs font-bold text-orange-600">₹{priceMax.toLocaleString("en-IN")}</span>
              </div>
              <input 
                type="range" 
                min="4000" 
                max="35000" 
                step="500"
                value={priceMax} 
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer" 
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                <span>₹4,000</span>
                <span>₹35,000</span>
              </div>
            </div>

            {/* Airlines */}
            <div>
              <p className="font-extrabold text-slate-850 text-xs uppercase tracking-wider mb-2">Airlines</p>
              <div className="space-y-2">
                {["IndiGo", "Air India", "Vistara", "SpiceJet", "Akasa Air"].map((air) => (
                  <label key={air} className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={airlineFilter.includes(air)}
                      onChange={() => handleAirlineToggle(air)}
                      className="rounded accent-orange-500" 
                    />
                    <span>{air}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Trust banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                TripMind Guarantee
              </p>
              <p>No booking card convenience fees. Real-time boarding status notification matches Kayak standards.</p>
            </div>

          </div>
        </aside>

        {/* RIGHT AREA: Flight results */}
        <div className="flex-1 space-y-6">
          
          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden">
            <button 
              type="button"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="w-full bg-slate-900 text-white font-extrabold text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow"
            >
              <Filter className="w-4 h-4 text-orange-500" />
              {showFiltersMobile ? "Hide Filter Options" : "Show Filter Options"}
            </button>
          </div>

          {/* cheapest/quickest Toggle Tabs */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm grid grid-cols-3 text-center text-xs font-bold">
            <button 
              onClick={() => setActiveTab("cheapest")}
              className={`py-3 rounded-lg transition duration-150 ${
                activeTab === "cheapest" 
                  ? "bg-slate-900 text-white shadow" 
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <p className="font-extrabold">CHEAPEST</p>
              <p className="text-[10px] opacity-80 mt-0.5">From ₹4,900</p>
            </button>
            <button 
              onClick={() => setActiveTab("best")}
              className={`py-3 rounded-lg transition duration-150 ${
                activeTab === "best" 
                  ? "bg-slate-900 text-white shadow" 
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <p className="font-extrabold">RECOMMENDED</p>
              <p className="text-[10px] opacity-80 mt-0.5">Direct • High Trust</p>
            </button>
            <button 
              onClick={() => setActiveTab("quickest")}
              className={`py-3 rounded-lg transition duration-150 ${
                activeTab === "quickest" 
                  ? "bg-slate-900 text-white shadow" 
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <p className="font-extrabold">QUICKEST</p>
              <p className="text-[10px] opacity-80 mt-0.5">2h 30m avg</p>
            </button>
          </div>

          {/* Results count indicator */}
          <p className="text-xs text-slate-500 font-bold pl-1 uppercase tracking-wider">
            Showing {filteredFlights.length} flights from {origin} to {destination}
          </p>

          {/* Flights list */}
          <div className="space-y-4">
            {filteredFlights.length > 0 ? (
              filteredFlights.map((flight) => (
                <div 
                  key={flight.id} 
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-sm hover:shadow transition duration-150 flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  {/* Timing & Details */}
                  <div className="flex-1 w-full flex items-center gap-4">
                    {/* Mock airline logo icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-[10px] shadow-inner ${flight.logo}`}>
                      {flight.airline.substring(0, 3).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-3 items-center gap-4">
                      {/* Times */}
                      <div>
                        <p className="font-extrabold text-sm text-slate-800">{flight.departs}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{origin.split(" ")[0]}</p>
                      </div>
                      
                      {/* Duration & Stops Visual */}
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{flight.duration}</p>
                        <div className="relative w-16 h-1 bg-slate-200 mx-auto my-1 rounded-full">
                          {flight.stops !== "Direct" && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-[10px] font-bold ${flight.stops === "Direct" ? "text-green-600" : "text-amber-600"}`}>
                          {flight.stops}
                        </p>
                      </div>

                      {/* Arriving Time */}
                      <div>
                        <p className="font-extrabold text-sm text-slate-800">{flight.arrives}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{destination.split(" ")[0]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Button (Kayak view deal layout) */}
                  <div className="w-full md:w-fit pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 flex md:flex-col items-center justify-between md:justify-center gap-4">
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">One-way starts at</p>
                      <p className="text-xl font-extrabold text-slate-900">₹{flight.price.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Free Cabin Baggage Included</p>
                    </div>
                    <button 
                      onClick={() => handleBook(flight)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition duration-150"
                    >
                      View Deal
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 space-y-3">
                <Plane className="w-8 h-8 mx-auto opacity-30 animate-pulse" />
                <p className="font-bold text-sm">No flights matches your criteria</p>
                <p className="text-xs">Try increasing the Max Price filter or selecting more airlines.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* BOOKING SUCCESS MODAL */}
      {bookedFlight && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Booking Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">Your flight with {bookedFlight.airline} has been locked in.</p>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-left space-y-2 text-xs font-semibold">
              <p className="flex justify-between"><span>Airline:</span> <span className="text-slate-900">{bookedFlight.airline}</span></p>
              <p className="flex justify-between"><span>Route:</span> <span className="text-slate-900">{origin.split(" ")[0]} → {destination.split(" ")[0]}</span></p>
              <p className="flex justify-between"><span>Departs:</span> <span className="text-slate-900">{bookedFlight.departs}</span></p>
              <p className="flex justify-between"><span>Total Cost:</span> <span className="text-slate-900 font-extrabold">₹{bookedFlight.price.toLocaleString("en-IN")}</span></p>
            </div>
            <button 
              onClick={() => setBookedFlight(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-6 py-6 text-center text-[10px] text-slate-400">
        © {new Date().getFullYear()} TripMind India. Optimised with Kayak booking feeds. Local fares displayed in INR.
      </footer>
    </main>
  );
}
