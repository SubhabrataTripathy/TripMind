"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Sparkles, MapPin, Calendar, Users, Plane, Hotel, Compass, 
  ArrowRight, Plus, Minus, ChevronDown, HelpCircle, Shield, CheckCircle, Heart 
} from "lucide-react";

// Dynamically import MapComponent to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 animate-pulse">Loading Map...</div>,
});

export default function Home() {
  const router = useRouter();
  
  // Custom Widget States matching screenshot
  const [departure, setDeparture] = useState("Any");
  const [prompt, setPrompt] = useState("");
  const [durationPreset, setDurationPreset] = useState<number>(5); // Default 5 Days
  
  // Dropdown visibility states
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showPrefDropdown, setShowPrefDropdown] = useState(false);

  // Calendar States
  const [showCalendar, setShowCalendar] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date(2026, 5, 28)); // June 28
  const [endDate, setEndDate] = useState<Date>(new Date(2026, 6, 2));   // July 2
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date(2026, 5, 1)); // Default June 2026

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    if (!date) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null as any);
    } else if (startDate && !endDate) {
      if (date >= startDate) {
        setEndDate(date);
        const diffTime = Math.abs(date.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDurationPreset(diffDays);
        setShowCalendar(false); // Close calendar on selection
      } else {
        setStartDate(date);
      }
    }
  };

  const isSelected = (date: Date) => {
    if (!date || !startDate) return false;
    if (startDate && !endDate) return date.getTime() === startDate.getTime();
    return date >= startDate && date <= endDate;
  };

  const calendarGrid = useMemo(() => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    
    // Day of the week the 1st of month falls on
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    // Total days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid: (Date | null)[] = [];
    
    // Pad initial empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push(null);
    }
    
    // Push actual Dates
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push(new Date(year, month, d));
    }
    
    return grid;
  }, [currentViewDate]);
  
  // Preference States
  const [selectedBudget, setSelectedBudget] = useState("Standard");
  const [selectedStyle, setSelectedStyle] = useState("Sightseeing");

  // Trending destinations list state
  const [activeCategory, setActiveCategory] = useState<"domestic" | "international">("domestic");
  const [activeDestIndex, setActiveDestIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const quickPrompts = useMemo(() => [
    { text: "Goa Beaches", dest: "Goa, India", days: 3, style: "Sightseeing", budget: "Standard", emoji: "🏖️" },
    { text: "Dubai Luxury Shopping", dest: "Dubai, UAE", days: 5, style: "Foodie", budget: "Luxury", emoji: "🛍️" },
    { text: "Singapore Family Tour", dest: "Singapore", days: 7, style: "Family", budget: "Standard", emoji: "🎡" },
    { text: "Manali Adventure", dest: "Manali, Himachal Pradesh", days: 5, style: "Adventure", budget: "Economy", emoji: "🏔️" },
    { text: "Jaipur Heritage & Food", dest: "Jaipur, Rajasthan", days: 3, style: "Foodie", budget: "Standard", emoji: "🏰" },
    { text: "Bali Getaway", dest: "Bali, Indonesia", days: 7, style: "Sightseeing", budget: "Standard", emoji: "🌴" },
  ], []);

  const handleQuickPromptClick = (qp: (typeof quickPrompts)[number]) => {
    setPrompt(qp.dest);
    setDurationPreset(qp.days);
    setSelectedStyle(qp.style);
    setSelectedBudget(qp.budget);
    
    // Set matching calendar dates dynamically starting from June 28
    const start = new Date(2026, 5, 28);
    const end = new Date(2026, 5, 28 + qp.days - 1);
    setStartDate(start);
    setEndDate(end);
  };

  const domesticDestinations = useMemo(() => [
    { 
      name: "Goa, India", 
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", 
      coords: [15.2993, 74.1240] as [number, number],
      time: "Trending #1",
      description: "Sandy beaches, historical forts, lively beach shacks, and fresh coastal seafood."
    },
    { 
      name: "Jaipur, Rajasthan", 
      img: "https://images.unsplash.com/photo-1477584322904-486a88530bc2?auto=format&fit=crop&w=800&q=80", 
      coords: [26.9124, 75.7873] as [number, number],
      time: "Trending #2",
      description: "The Pink City. Palaces, historic forts, royal heritage, and traditional thali."
    },
    { 
      name: "Manali, Himachal Pradesh", 
      img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80", 
      coords: [32.2396, 77.1887] as [number, number],
      time: "Trending #3",
      description: "Himalayan valley. Solang adventure sports, Rohtang snowy pass, and cedar forest paths."
    },
    { 
      name: "Agra, Uttar Pradesh", 
      img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80", 
      coords: [27.1767, 78.0081] as [number, number],
      time: "Trending #4",
      description: "Home of the Taj Mahal, historic Agra Fort, Mughlai cuisines, and marble crafts."
    },
    { 
      name: "Munnar, Kerala", 
      img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80", 
      coords: [10.0889, 77.0595] as [number, number],
      time: "Trending #5",
      description: "Sprawling tea gardens, mist-covered mountain summits, and spice plantations."
    },
    { 
      name: "Srinagar, Kashmir", 
      img: "https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?auto=format&fit=crop&w=800&q=80", 
      coords: [34.0837, 74.7973] as [number, number],
      time: "Trending #6",
      description: "Dal Lake houseboats, mughal garden walks, shikhara rides, and local saffron tea."
    },
    { 
      name: "Darjeeling, West Bengal", 
      img: "https://images.unsplash.com/photo-1557999818-b7c191a3be98?auto=format&fit=crop&w=800&q=80", 
      coords: [27.0410, 88.2627] as [number, number],
      time: "Trending #7",
      description: "Scenic toy train rides, tea estates, views of Kanchenjunga peak, and Tibetan monasteries."
    },
    { 
      name: "Udaipur, Rajasthan", 
      img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80", 
      coords: [24.5854, 73.7125] as [number, number],
      time: "Trending #8",
      description: "The City of Lakes. Lake Pichola boat cruises, grand City Palace, and lakefront dining."
    },
    { 
      name: "Ooty, Tamil Nadu", 
      img: "https://images.unsplash.com/photo-1589993375836-de600c0f839c?auto=format&fit=crop&w=800&q=80", 
      coords: [11.4102, 76.6950] as [number, number],
      time: "Trending #9",
      description: "Nilgiri toy train paths, botanical nurseries, lake views, and homemade chocolates."
    },
    { 
      name: "Varanasi, Uttar Pradesh", 
      img: "https://images.unsplash.com/photo-1561361531-99522c36d6d4?auto=format&fit=crop&w=800&q=80", 
      coords: [25.3176, 82.9739] as [number, number],
      time: "Trending #10",
      description: "Ganga river morning boat rides, historic ghat strolls, and evening Ganga Aarti ceremonies."
    },
    { 
      name: "Hampi, Karnataka", 
      img: "https://images.unsplash.com/photo-1600100397608-f010e4bc1bf2?auto=format&fit=crop&w=800&q=80", 
      coords: [15.3350, 76.4600] as [number, number],
      time: "Trending #11",
      description: "Ancient stone temple ruins, boulder-strewn landscape ridges, and coracle river rides."
    },
    { 
      name: "Leh Ladakh", 
      img: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=800&q=80", 
      coords: [34.1526, 77.5770] as [number, number],
      time: "Trending #12",
      description: "High-altitude desert passes, Pangong Lake blue waters, and Buddhist monasteries."
    },
    { 
      name: "Alleppey, Kerala", 
      img: "https://images.unsplash.com/photo-1593693411515-c202e974eb87?auto=format&fit=crop&w=800&q=80", 
      coords: [9.4981, 76.3388] as [number, number],
      time: "Trending #13",
      description: "Cruising Kerala backwaters on traditional houseboats through palm-fringed canals."
    },
    { 
      name: "Shimla, Himachal Pradesh", 
      img: "https://images.unsplash.com/photo-1618218168350-6e7c81151b64?auto=format&fit=crop&w=800&q=80", 
      coords: [31.1048, 77.1734] as [number, number],
      time: "Trending #14",
      description: "Historic ridge walk, Mall road shopping, and toy train paths amidst pine forests."
    },
    { 
      name: "Rishikesh, Uttarakhand", 
      img: "https://images.unsplash.com/photo-1598977123418-45f04b61b4bb?auto=format&fit=crop&w=800&q=80", 
      coords: [30.0869, 78.2676] as [number, number],
      time: "Trending #15",
      description: "River rafting, Laxman Jhula bridge, yoga centers, and Ganga river ghat prayers."
    }
  ], []);

  const internationalDestinations = useMemo(() => [
    {
      name: "Dubai, UAE",
      img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
      coords: [25.2048, 55.2708] as [number, number],
      time: "Popular Global #1",
      description: "Futuristic Burj Khalifa views, luxury shopping malls, desert jeep safaris, and souks."
    },
    {
      name: "Singapore",
      img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
      coords: [1.3521, 103.8198] as [number, number],
      time: "Popular Global #2",
      description: "Gardens by the Bay supertrees, Sentosa Island beaches, and diverse Hawker food centers."
    },
    {
      name: "Bangkok, Thailand",
      img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
      coords: [13.7563, 100.5018] as [number, number],
      time: "Popular Global #3",
      description: "Grand historic temples, buzzing city canals, floating markets, and street side dining."
    },
    {
      name: "Bali, Indonesia",
      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
      coords: [-8.4095, 115.1889] as [number, number],
      time: "Popular Global #4",
      description: "Ubud rice terrace hikes, volcanic cliffs, beach clubs, and serene ancient shrines."
    },
    {
      name: "Paris, France",
      img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
      coords: [48.8566, 2.3522] as [number, number],
      time: "Popular Global #5",
      description: "Eiffel Tower lightings, Louvre art treasures, Seine river boat tours, and pastry shops."
    },
    {
      name: "Tokyo, Japan",
      img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      coords: [35.6762, 139.6503] as [number, number],
      time: "Popular Global #6",
      description: "Shibuya crossing, futuristic robot cafes, sushi markets, and cherry blossom gardens."
    },
    {
      name: "London, UK",
      img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
      coords: [51.5074, -0.1278] as [number, number],
      time: "Popular Global #7",
      description: "Tower Bridge walks, Big Ben views, royal palace guard changes, and museums."
    },
    {
      name: "New York, USA",
      img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
      coords: [40.7128, -74.0060] as [number, number],
      time: "Popular Global #8",
      description: "Times Square neon lights, Central Park walks, Broadway plays, and skyscraper views."
    },
    {
      name: "Rome, Italy",
      img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
      coords: [41.9028, 12.4964] as [number, number],
      time: "Popular Global #9",
      description: "The Colosseum, Trevi Fountain wishes, Vatican museums, and authentic woodfired pizza."
    },
    {
      name: "Sydney, Australia",
      img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
      coords: [-33.8688, 151.2093] as [number, number],
      time: "Popular Global #10",
      description: "Sydney Opera House views, Harbour Bridge climbs, and surfing at Bondi Beach."
    },
    {
      name: "Male, Maldives",
      img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
      coords: [4.1755, 73.5093] as [number, number],
      time: "Popular Global #11",
      description: "Overwater luxury villas, turquoise coral lagoons, diving, and sandy white shores."
    },
    {
      name: "Phuket, Thailand",
      img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
      coords: [7.8804, 98.3922] as [number, number],
      time: "Popular Global #12",
      description: "Patong beach life, Phi Phi island speedboat tours, and night dining streets."
    },
    {
      name: "Amsterdam, Netherlands",
      img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      coords: [52.3676, 4.9041] as [number, number],
      time: "Popular Global #13",
      description: "Canal boat tours, tulip garden fields, historic museums, and bicycle lanes."
    },
    {
      name: "Cape Town, South Africa",
      img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80",
      coords: [-33.9249, 18.4241] as [number, number],
      time: "Popular Global #14",
      description: "Table Mountain cable rides, penguin beach walks, and Cape Peninsula wineries."
    },
    {
      name: "Kuala Lumpur, Malaysia",
      img: "https://images.unsplash.com/photo-1596422846543-75c6fc1f7f43?auto=format&fit=crop&w=800&q=80",
      coords: [3.1390, 101.6869] as [number, number],
      time: "Popular Global #15",
      description: "Petronas Twin Towers photo spots, Batu Caves stairs, and shopping malls."
    }
  ], []);

  const faqs = [
    {
      q: "How does the TripMind AI planner work?",
      a: "TripMind analyzes your inputs using Google's advanced Gemma 4 LLM to retrieve flights, trains, hotel recommendations, and sightseeing options. It then designs a day-by-day itinerary complete with geographic coordinate mapping."
    },
    {
      q: "Is the itinerary customizable?",
      a: "Yes, absolutely! Once generated, you can rearrange stops, edit descriptions, add custom stops with automatic coordinate offsets, or delete activities. The cost breakdown will update in real time."
    },
    {
      q: "Are the train and flight prices real?",
      a: "The system provides highly realistic local estimates in Indian Rupees (₹) based on seasonal averages, allowing you to gauge the actual expenses of your holiday."
    },
    {
      q: "Can I download or print the plan?",
      a: "Yes, you can click the 'Export PDF' button on the dashboard to trigger a print-friendly view formatted as a clean travel book, perfect for saving offline or printing."
    }
  ];

  // Map activities for display on the landing page map based on selected category
  const mapPins = useMemo(() => {
    const list = activeCategory === "domestic" ? domesticDestinations : internationalDestinations;
    return list.map((dest, idx) => ({
      title: dest.name,
      time: dest.time,
      location: dest.description,
      coords: dest.coords
    }));
  }, [activeCategory, domesticDestinations, internationalDestinations]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDestination = prompt.trim() || "Goa, India";
    const query = `A ${durationPreset}-day vacation to ${finalDestination} starting from ${departure === "Any" ? "Delhi" : departure} with ${selectedBudget} budget and ${selectedStyle} style.`;
    router.push(`/planner?prompt=${encodeURIComponent(query)}`);
  };

  const handleCreateMyself = () => {
    const finalDestination = prompt.trim() || "Goa, India";
    const query = `Blank Itinerary to ${finalDestination} duration ${durationPreset} Days`;
    router.push(`/planner?prompt=${encodeURIComponent(query)}`);
  };

  const handlePinSelect = (category: "domestic" | "international", index: number) => {
    const list = category === "domestic" ? domesticDestinations : internationalDestinations;
    const dest = list[index];
    setActiveCategory(category);
    setActiveDestIndex(index);
    setPrompt(dest.name);
  };

  const handleDetectLocation = () => {
    setShowDepartureDropdown(false);
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setDeparture("Detecting...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.state || "My Location";
            setDeparture(city);
          } else {
            setDeparture("My Location");
          }
        } catch (err) {
          setDeparture("My Location");
        }
      },
      (err) => {
        console.warn("User location detection failed:", err.message);
        setDeparture("Any");
      }
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-16 relative overflow-hidden">
      {/* Ambient background blur circles */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/30 to-indigo-100/30 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-250px] w-[700px] h-[700px] bg-gradient-to-bl from-sky-100/35 to-blue-100/35 rounded-full blur-[150px] pointer-events-none" />
      
      {/* Centered Main Grid Container */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 space-y-8">
        
        {/* Navbar Header */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/10 text-white">
              <Sparkles className="w-4.5 h-4.5 fill-current text-white animate-pulse" />
            </div>
            <span className="font-extrabold tracking-tight text-xl text-slate-900">
              Trip<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">Mind</span>
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6 text-xs font-semibold text-slate-500">
            <button 
              onClick={() => router.push("/flights")}
              className="flex items-center gap-1 hover:text-blue-900 transition-colors cursor-pointer"
            >
              <Plane className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Flight/Train</span>
            </button>
            <button 
              onClick={() => router.push("/hotels")}
              className="flex items-center gap-1 hover:text-blue-900 transition-colors cursor-pointer"
            >
              <Hotel className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Hotels</span>
            </button>
            <button 
              onClick={() => router.push("/login")}
              className="bg-blue-900 hover:bg-blue-800 text-white px-3 sm:px-4 py-1.5 rounded-md transition duration-150 text-[10px] sm:text-xs cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Title Section */}
        <div className="space-y-2 pt-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/80 text-[9px] font-extrabold text-blue-700 uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-blue-600 fill-current animate-pulse" />
            AI Travel Planning 2.0
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Plan your holiday in <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">seconds</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Get customized itineraries, stays, and transit details in Rupees (₹) instantly. Built for seamless holiday planning.
          </p>
        </div>

        {/* SEARCH WIDGET + MAP ROW (Side-by-Side matching screenshot) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Search Widget Card (7/12 cols) */}
          <div className="lg:col-span-7 h-[280px]">
            <form onSubmit={handleGenerate} className="bg-white rounded-2xl border border-slate-100 shadow-xl p-5 md:p-6 h-full flex flex-col justify-between">
              
              {/* Top Bar: Selectors */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                {/* Starting From */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold uppercase tracking-wider text-[9px] text-slate-400">Starting from</span>
                  <div className="relative inline-block">
                    <button 
                      type="button" 
                      onClick={() => setShowDepartureDropdown(!showDepartureDropdown)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200/65 bg-slate-50 hover:bg-slate-105 hover:border-slate-300 text-slate-800 font-extrabold flex items-center gap-1 transition-all text-[10px] md:text-[11px]"
                    >
                      {departure}
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    
                    {showDepartureDropdown && (
                      <div className="absolute left-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-lg py-1.5 w-48 z-[2000] text-xs font-semibold">
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-emerald-700 border-b border-slate-100 flex items-center gap-1.5 font-bold"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          Current Location
                        </button>
                        {["Any", "New Delhi", "Mumbai", "Bengaluru", "Kolkata", "Goa"].map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => { setDeparture(city); setShowDepartureDropdown(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-800"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences */}
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowPrefDropdown(!showPrefDropdown)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200/65 bg-slate-50 hover:bg-slate-105 hover:border-slate-300 text-slate-800 font-extrabold flex items-center gap-1 transition-all text-[10px] md:text-[11px]"
                  >
                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-50" />
                    Preferences
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  
                  {showPrefDropdown && (
                    <div className="absolute right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl p-4 w-60 z-[2000] text-xs font-semibold space-y-3">
                      <div>
                        <p className="text-slate-400 text-[9px] font-bold uppercase mb-1">Budget level</p>
                        <div className="flex gap-1.5">
                          {["Economy", "Standard", "Luxury"].map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => setSelectedBudget(b)}
                              className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                                selectedBudget === b 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-450 text-[9px] font-bold uppercase mb-1">Travel style</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Family", "Sightseeing", "Adventure", "Foodie"].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelectedStyle(s)}
                              className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                                selectedStyle === s 
                                  ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Section: Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 my-4">
                {/* Heading to */}
                <div className="md:col-span-8 flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.015)] focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-50/50">
                  <MapPin className="w-5 h-5 text-slate-450 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label className="block text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Heading to</label>
                    <input 
                      type="text" 
                      placeholder="Country / City / Landmark" 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="text-xs font-bold text-slate-800 outline-none w-full bg-transparent mt-1.5 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="md:col-span-4 relative flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-[0_2px_4px_rgba(0,0,0,0.015)] focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-50/50">
                  <Calendar className="w-5 h-5 text-slate-450 flex-shrink-0" />
                  <div className="flex-1">
                    <label className="block text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Date/Duration</label>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="text-xs font-bold text-slate-800 text-left w-full mt-1.5 focus:outline-none"
                    >
                      {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} 
                      {endDate ? ` - ${endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                      <span className="text-[10px] text-blue-600 ml-1">({durationPreset} Days)</span>
                    </button>
                  </div>

                  {showCalendar && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-72 z-[2000] text-xs font-semibold">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                        <div className="flex items-center gap-1">
                          {/* Month Selector */}
                          <select 
                            value={currentViewDate.getMonth()}
                            onChange={(e) => setCurrentViewDate(new Date(currentViewDate.getFullYear(), Number(e.target.value), 1))}
                            className="font-extrabold text-slate-900 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded px-1 text-xs"
                          >
                            {Array.from({ length: 12 }).map((_, m) => (
                              <option key={m} value={m}>
                                {new Date(2026, m, 1).toLocaleString("en-IN", { month: "long" })}
                              </option>
                            ))}
                          </select>
                          
                          {/* Year Selector */}
                          <select 
                            value={currentViewDate.getFullYear()}
                            onChange={(e) => setCurrentViewDate(new Date(Number(e.target.value), currentViewDate.getMonth(), 1))}
                            className="font-extrabold text-slate-900 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded px-1 text-xs"
                          >
                            {Array.from({ length: 10 }).map((_, y) => {
                              const yr = 2026 + y; // 2026 to 2035
                              return (
                                <option key={yr} value={yr}>
                                  {yr}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            type="button" 
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition"
                          >
                            &larr;
                          </button>
                          <button 
                            type="button" 
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-slate-100 rounded text-slate-700 transition"
                          >
                            &rarr;
                          </button>
                        </div>
                      </div>
                      
                      {/* Weekdays */}
                      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                      </div>
                      
                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {calendarGrid.map((date, idx) => {
                          if (date === null) {
                            return <div key={`empty-${idx}`} className="py-2"></div>;
                          }
                          const selected = isSelected(date);
                          const isStart = startDate && date.getTime() === startDate.getTime();
                          const isEnd = endDate && date.getTime() === endDate.getTime();
                          
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleDateClick(date)}
                              className={`py-2 rounded-lg text-[10px] font-bold transition-all ${
                                selected 
                                  ? isStart || isEnd 
                                    ? "bg-slate-900 text-white shadow-sm" 
                                    : "bg-blue-50 text-blue-800"
                                  : "hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 text-[9px] text-slate-400 text-center font-medium border-t border-slate-100 pt-2 flex items-center justify-between">
                        <span>Selected: {durationPreset} Days</span>
                        <span>Click start then end date.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Buttons */}
              <div className="grid grid-cols-2 gap-3.5 pt-3.5 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={handleCreateMyself}
                  className="w-full border border-slate-250 text-slate-700 bg-white font-extrabold text-xs py-3 rounded-xl hover:bg-slate-50 hover:border-slate-350 transition-all active:scale-[0.98]"
                >
                  Create It Myself
                </button>
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-650 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300 fill-current animate-pulse" />
                  Plan a Trip with AI
                </button>
              </div>

            </form>
          </div>

          {/* Right: Small Map Card Preview (5/12 cols) */}
          <div className="lg:col-span-5 h-[280px] relative rounded-2xl overflow-hidden border border-slate-100 shadow-xl z-10 bg-slate-100">
            <MapComponent 
              activities={mapPins} 
              activeActivityIndex={activeDestIndex}
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold shadow-sm z-[1000] text-blue-900">
              📍 Map Explorer
            </div>
          </div>

        </div>

        {/* Sleek Glassmorphic Stats Bar */}
        <div className="bg-white/70 backdrop-blur-md border border-slate-100/80 rounded-2xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { value: "30+", label: "Premium Cities" },
            { value: "Instant", label: "AI Itineraries" },
            { value: "₹ INR", label: "Indian Rupees Cost" },
            { value: "100%", label: "Mobile Aligned" }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-0.5 md:border-r last:border-r-0 border-slate-200/50">
              <p className="text-sm font-black text-slate-900">{stat.value}</p>
              <p className="text-[9px] font-extrabold text-slate-455 uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick suggestions shortcut */}
        <div className="flex flex-wrap items-center gap-2.5 pl-1 relative z-10">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Try prompts:</span>
          {quickPrompts.map((qp, i) => (
            <button 
              key={i} 
              type="button"
              onClick={() => handleQuickPromptClick(qp)} 
              className="text-xs bg-white hover:bg-slate-50 hover:border-slate-350 text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-full border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.015)] transition-all font-semibold cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <span>{qp.emoji}</span>
              <span>{qp.text}</span>
            </button>
          ))}
        </div>

        {/* Categories Section for Getaways (Grid layout spans full width) */}
        <div className="pt-6 border-t border-slate-200">
          <div className="flex gap-4 border-b border-slate-200 pb-2 mb-4">
            <button
              onClick={() => { setActiveCategory("domestic"); setActiveDestIndex(null); }}
              className={`text-sm font-bold pb-2 transition duration-150 ${
                activeCategory === "domestic" 
                  ? "text-blue-900 border-b-2 border-blue-900" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Popular Domestic Tours
            </button>
            <button
              onClick={() => { setActiveCategory("international"); setActiveDestIndex(null); }}
              className={`text-sm font-bold pb-2 transition duration-150 ${
                activeCategory === "international" 
                  ? "text-blue-900 border-b-2 border-blue-900" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Trending International Tours
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(activeCategory === "domestic" ? domesticDestinations : internationalDestinations).map((dest, i) => (
              <div 
                key={i} 
                onClick={() => handlePinSelect(activeCategory, i)}
                onMouseEnter={() => setActiveDestIndex(i)}
                className={`group flex gap-4 p-3.5 rounded-xl border cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                  activeDestIndex === i 
                    ? "border-blue-600 bg-blue-50/30 shadow-md shadow-blue-500/5" 
                    : "border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100/80"
                }`}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {!imageErrors[dest.name] ? (
                    <img 
                      src={dest.img} 
                      alt={dest.name} 
                      referrerPolicy="no-referrer"
                      onError={() => {
                        console.warn(`Failed to load image for ${dest.name}, falling back.`);
                        setImageErrors(prev => ({ ...prev, [dest.name]: true }));
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex flex-col items-center justify-center font-extrabold text-[11px] tracking-wider">
                      <Compass className="w-4 h-4 text-blue-550 mb-0.5 animate-pulse" />
                      {dest.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                      {dest.name}
                      <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        activeCategory === "domestic" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        {activeCategory === "domestic" ? "India" : "Global"}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{dest.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Weather Sync</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose TripMind Feature Highlights Grid */}
        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6">Why Choose TripMind Planner?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex gap-3 items-start bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-900 flex-shrink-0">
                <Sparkles className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">AI Personalization</h4>
                <p className="text-[11px] text-slate-500 mt-1">Smart hotels, local food shacks, and sightseeing details mapped dynamically.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-900 flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">Real-Time Maps</h4>
                <p className="text-[11px] text-slate-500 mt-1">Calculates optimal geographic paths, plotting connected lines day-by-day.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-900 flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">Rupees Pricing (₹)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Flight, train, hotel, and attraction ticket budgets are shown in Rupees.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-900 flex-shrink-0">
                <Compass className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-800">Interactive Canvas</h4>
                <p className="text-[11px] text-slate-500 mt-1">Drag and drop, insert, edit, or delete stops and re-calculate total costs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-3 max-w-3xl">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 text-left transition duration-150"
                >
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-900" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    openFaq === idx ? "transform rotate-180" : ""
                  }`} />
                </button>
                {openFaq === idx && (
                  <div className="p-4 bg-white border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-[10px] text-slate-400 pt-12 border-t border-slate-200">
          © {new Date().getFullYear()} TripMind India. Optimised for Domestic & International Getaways.
        </footer>

      </div>
    </main>
  );
}
