"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Hotel, ArrowLeft, Search, Filter, ChevronDown, Star, MapPin, Calendar,
  ShieldCheck, Wifi, Sparkles, Check, Home, Award
} from "lucide-react";

export default function HotelsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><div className="w-8 h-8 animate-spin border-4 border-blue-900 rounded-full" /></div>}>
      <HotelsPage />
    </Suspense>
  );
}

function HotelsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Pre-fills
  const initialDest = searchParams.get("destination") || "Goa, India";

  // Search Fields state
  const [destination, setDestination] = useState(initialDest);
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  // Filters State
  const [starsFilter, setStarsFilter] = useState<number | null>(null); // null means "All"
  const [ratingFilter, setRatingFilter] = useState<number>(0); // 0 means "All"
  const [priceMax, setPriceMax] = useState<number>(25000);
  const [amenitiesFilter, setAmenitiesFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"recommended" | "cheapest" | "popular">("recommended");
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Booking Modal State
  const [bookedHotel, setBookedHotel] = useState<any | null>(null);

  // Mock Hotels Database (Rupee ₹ pricing aligned to Indian markets)
  const allHotels = useMemo(() => [
    { id: 1, name: "Taj Exotica Resort & Spa, Goa", stars: 5, rating: 9.2, ratingWord: "Excellent", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi", "Pool", "Spa", "Gym"], price: 18500, location: "Benaulim, Goa" },
    { id: 2, name: "Novotel Goa Resort & Spa", stars: 4, rating: 8.4, ratingWord: "Very Good", img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi", "Pool", "Gym"], price: 7200, location: "Candolim, Goa" },
    { id: 3, name: "Marina Bay Sands, Singapore", stars: 5, rating: 9.5, ratingWord: "Superb", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi", "Pool", "Spa", "Gym"], price: 32000, location: "Bayfront, Singapore" },
    { id: 4, name: "Millennium Plaza Hotel, Dubai", stars: 4, rating: 8.2, ratingWord: "Very Good", img: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi", "Pool", "Gym"], price: 9500, location: "Sheikh Zayed Road, Dubai" },
    { id: 5, name: "Atlantis The Palm, Dubai", stars: 5, rating: 9.4, ratingWord: "Excellent", img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi", "Pool", "Spa", "Gym"], price: 28000, location: "The Palm Jumeirah, Dubai" },
    { id: 6, name: "Furama RiverFront, Singapore", stars: 4, rating: 8.1, ratingWord: "Very Good", img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi", "Pool"], price: 8800, location: "Havelock Road, Singapore" },
    { id: 7, name: "Santana Beach Resort, Goa", stars: 3, rating: 7.8, ratingWord: "Good", img: "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi", "Pool"], price: 3800, location: "Candolim, Goa" },
    { id: 8, name: "Ginger Hotel, New Delhi", stars: 3, rating: 7.2, ratingWord: "Good", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80", amenities: ["WiFi"], price: 2850, location: "Connaught Place, New Delhi" }
  ], []);

  // Filter hotels dynamically
  const filteredHotels = useMemo(() => {
    let list = [...allHotels];

    // Filter by stars
    if (starsFilter !== null) {
      list = list.filter(h => h.stars === starsFilter);
    }

    // Filter by user rating
    if (ratingFilter > 0) {
      list = list.filter(h => h.rating >= ratingFilter);
    }

    // Filter by price
    list = list.filter(h => h.price <= priceMax);

    // Filter by amenities
    if (amenitiesFilter.length > 0) {
      list = list.filter(h => 
        amenitiesFilter.every(amenity => h.amenities.includes(amenity))
      );
    }

    // Sort by Active Tab
    if (activeTab === "cheapest") {
      list.sort((a, b) => a.price - b.price);
    } else if (activeTab === "popular") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [allHotels, starsFilter, ratingFilter, priceMax, amenitiesFilter, activeTab]);

  const handleAmenityToggle = (name: string) => {
    if (amenitiesFilter.includes(name)) {
      setAmenitiesFilter(amenitiesFilter.filter(item => item !== name));
    } else {
      setAmenitiesFilter([...amenitiesFilter, name]);
    }
  };

  const handleBook = (hotel: any) => {
    setBookedHotel(hotel);
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
              <Hotel className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-lg text-slate-900">
              Trip<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">Mind</span> <span className="text-slate-450 font-normal">Hotels</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
          <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            Kayak Search Engine
          </span>
        </div>
      </header>

      {/* SUB-HEADER HOTEL SEARCH CARD (Replicating Kayak) */}
      <section className="bg-blue-950 text-white px-6 py-8 shadow-inner">
        <div className="max-w-6xl mx-auto space-y-4">
          
          {/* Row 1: Rooms & Guests selection */}
          <div className="flex gap-4 text-xs font-bold text-blue-200">
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                className="hover:text-white flex items-center gap-1"
              >
                <span>{rooms} Room, {guests} Guests</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {showGuestDropdown && (
                <div className="absolute left-0 mt-2 bg-white text-slate-800 border border-slate-200 shadow-2xl rounded-xl p-4 w-48 z-[2000] text-xs font-semibold space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Rooms</span>
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={rooms <= 1} onClick={() => setRooms(rooms - 1)} className="px-1.5 py-0.5 bg-slate-100 rounded disabled:opacity-30">-</button>
                      <span>{rooms}</span>
                      <button type="button" onClick={() => setRooms(rooms + 1)} className="px-1.5 py-0.5 bg-slate-100 rounded">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Guests</span>
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={guests <= 1} onClick={() => setGuests(guests - 1)} className="px-1.5 py-0.5 bg-slate-100 rounded disabled:opacity-30">-</button>
                      <span>{guests}</span>
                      <button type="button" onClick={() => setGuests(guests + 1)} className="px-1.5 py-0.5 bg-slate-100 rounded">+</button>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowGuestDropdown(false)}
                    className="w-full bg-blue-900 text-white font-bold py-1 rounded text-[11px]"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Search inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
            {/* Destination */}
            <div className="lg:col-span-6 bg-white text-slate-850 px-4 py-2.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.015)] focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <MapPin className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent font-bold outline-none text-sm w-full"
                placeholder="Enter City or Hotel Name" 
              />
            </div>

            {/* Check-in / Check-out Dates */}
            <div className="lg:col-span-4 bg-white text-slate-850 px-4 py-2.5 rounded-lg border border-slate-200 flex items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.015)]">
              <Calendar className="w-4 h-4 text-slate-455" />
              <div className="text-xs font-bold">
                <span className="block text-[8px] text-slate-400 uppercase tracking-wider leading-none">Check-in / Check-out</span>
                <span className="block mt-0.5 text-slate-750">28 Jun - 03 Jul</span>
              </div>
            </div>

            {/* Search Trigger */}
            <button className="lg:col-span-2 bg-gradient-to-r from-blue-600 via-indigo-650 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white font-extrabold rounded-lg flex items-center justify-center gap-2 transition px-6 py-2.5 text-sm shadow-md shadow-blue-500/10 active:scale-[0.98] cursor-pointer">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>

        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <section className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* LEFT COLUMN: Filters */}
        <aside className={`${showFiltersMobile ? "block" : "hidden"} md:block w-full md:w-64 flex-shrink-0 space-y-6`}>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-blue-600" />
                Filter Hotels
              </h3>
              <button 
                onClick={() => { setStarsFilter(null); setRatingFilter(0); setPriceMax(25000); setAmenitiesFilter([]); }}
                className="text-[10px] text-blue-600 hover:underline font-bold"
              >
                Clear all
              </button>
            </div>

            {/* Stars rating */}
            <div>
              <p className="font-extrabold text-slate-850 text-xs uppercase tracking-wider mb-2">Stars Rating</p>
              <div className="flex gap-2">
                {[null, 3, 4, 5].map((s) => (
                  <button
                    key={s === null ? "all" : s}
                    onClick={() => setStarsFilter(s)}
                    className={`flex-1 py-1 rounded text-xs font-bold border transition ${
                      starsFilter === s 
                        ? "bg-blue-900 text-white border-blue-900 shadow-sm" 
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    {s === null ? "All" : `${s}⭐`}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Budget Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-extrabold text-slate-850 text-xs uppercase tracking-wider">Max Price / Night</p>
                <span className="text-xs font-bold text-blue-650">₹{priceMax.toLocaleString("en-IN")}</span>
              </div>
              <input 
                type="range" 
                min="2000" 
                max="25000" 
                step="500"
                value={priceMax} 
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer" 
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                <span>₹2,000</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* User rating */}
            <div>
              <p className="font-extrabold text-slate-850 text-xs uppercase tracking-wider mb-2">User Rating</p>
              <div className="space-y-2">
                {[0, 9.0, 8.0, 7.0].map((rate) => (
                  <label key={rate} className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input 
                      type="radio" 
                      name="rating" 
                      checked={ratingFilter === rate}
                      onChange={() => setRatingFilter(rate)}
                      className="accent-blue-600" 
                    />
                    <span>{rate === 0 ? "Any rating" : `Excellent (${rate}+)`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities checkbox */}
            <div>
              <p className="font-extrabold text-slate-850 text-xs uppercase tracking-wider mb-2">Amenities</p>
              <div className="space-y-2">
                {["WiFi", "Pool", "Spa", "Gym"].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={amenitiesFilter.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="rounded accent-blue-600" 
                    />
                    <span>{amenity === "WiFi" ? "Free WiFi" : amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Guarantee badge */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
                TripMind Certified
              </p>
              <p>All hotels feature pre-verified check-in times and strict health compliance checks.</p>
            </div>

          </div>
        </aside>

        {/* RIGHT COLUMN: Results grid */}
        <div className="flex-1 space-y-6">
          
          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden">
            <button 
              type="button"
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="w-full bg-slate-900 text-white font-extrabold text-xs py-3 rounded-lg flex items-center justify-center gap-2 shadow"
            >
              <Filter className="w-4 h-4 text-blue-600" />
              {showFiltersMobile ? "Hide Filter Options" : "Show Filter Options"}
            </button>
          </div>

          {/* recommended/cheapest toggle tabs */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm grid grid-cols-3 text-center text-xs font-bold">
            <button 
              onClick={() => setActiveTab("recommended")}
              className={`py-3 rounded-lg transition duration-150 ${
                activeTab === "recommended" 
                  ? "bg-slate-900 text-white shadow" 
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <p className="font-extrabold">RECOMMENDED</p>
              <p className="text-[10px] opacity-80 mt-0.5">Top Matches</p>
            </button>
            <button 
              onClick={() => setActiveTab("cheapest")}
              className={`py-3 rounded-lg transition duration-150 ${
                activeTab === "cheapest" 
                  ? "bg-slate-900 text-white shadow" 
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <p className="font-extrabold">CHEAPEST</p>
              <p className="text-[10px] opacity-80 mt-0.5">Fares from ₹2,850</p>
            </button>
            <button 
              onClick={() => setActiveTab("popular")}
              className={`py-3 rounded-lg transition duration-150 ${
                activeTab === "popular" 
                  ? "bg-slate-900 text-white shadow" 
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <p className="font-extrabold">USER RATING</p>
              <p className="text-[10px] opacity-80 mt-0.5">Score 8.5+ first</p>
            </button>
          </div>

          {/* Results count text */}
          <p className="text-xs text-slate-500 font-bold pl-1 uppercase tracking-wider">
            Showing {filteredHotels.length} verified hotels in {destination}
          </p>

          {/* Hotels grid list */}
          <div className="space-y-4">
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => (
                <div 
                  key={hotel.id}
                  className="bg-white border border-slate-200 hover:border-slate-350 rounded-xl overflow-hidden shadow-sm hover:shadow transition duration-150 flex flex-col sm:flex-row"
                >
                  {/* Left block: Image */}
                  <div className="w-full sm:w-56 h-48 sm:h-auto relative bg-slate-100 flex-shrink-0">
                    <img src={hotel.img} alt={hotel.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Center block: Info */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                        ))}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base mt-1">{hotel.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        {hotel.location}
                      </p>
                    </div>

                    {/* Review Score and Amenities */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="bg-blue-900 text-white font-extrabold px-2 py-1 rounded text-xs leading-none shadow-sm">
                        {hotel.rating}
                      </span>
                      <span className="text-xs text-slate-700 font-bold">
                        {hotel.ratingWord}
                      </span>
                      
                      <div className="flex gap-1.5 text-[10px] font-bold text-slate-500 ml-auto">
                        {hotel.amenities.map((a) => (
                          <span key={a} className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {a === "WiFi" ? "WiFi" : a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right block: Pricing and Booking */}
                  <div className="p-5 border-t sm:border-t-0 sm:border-l border-slate-150 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-4 min-w-[150px] bg-slate-50/50">
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase">Price per night</p>
                      <p className="text-xl font-extrabold text-slate-900">₹{hotel.price.toLocaleString("en-IN")}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Excludes Local Taxes</p>
                    </div>
                    <button 
                      onClick={() => handleBook(hotel)}
                      className="bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition duration-150"
                    >
                      Book Room
                    </button>
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 space-y-3">
                <Hotel className="w-8 h-8 mx-auto opacity-30 animate-pulse" />
                <p className="font-bold text-sm">No hotels matches your criteria</p>
                <p className="text-xs">Try increasing the Max Price filter or selecting fewer amenity requirements.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* CONFIRMATION SUCCESS MODAL */}
      {bookedHotel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Booking Confirmed!</h3>
              <p className="text-xs text-slate-500 mt-1">Your reservation at {bookedHotel.name} is now complete.</p>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-left space-y-2 text-xs font-semibold">
              <p className="flex justify-between"><span>Hotel:</span> <span className="text-slate-900">{bookedHotel.name}</span></p>
              <p className="flex justify-between"><span>Location:</span> <span className="text-slate-900">{bookedHotel.location}</span></p>
              <p className="flex justify-between"><span>Rating:</span> <span className="text-slate-900">{bookedHotel.rating} ⭐ ({bookedHotel.ratingWord})</span></p>
              <p className="flex justify-between"><span>Total Cost / Night:</span> <span className="text-slate-900 font-extrabold">₹{bookedHotel.price.toLocaleString("en-IN")}</span></p>
            </div>
            <button 
              onClick={() => setBookedHotel(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-6 py-6 text-center text-[10px] text-slate-400">
        © {new Date().getFullYear()} TripMind India. Optimised with Kayak booking feeds. Local taxes and services excluded.
      </footer>
    </main>
  );
}
