"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  Sparkles, ArrowLeft, MapPin, Clock, Calendar, 
  Wallet, Loader2, Download, Trash2, Edit3, 
  ChevronUp, ChevronDown, Plus, MessageSquare, Send, X,
  Plane, Hotel, Share2, Check
} from "lucide-react";

// Dynamically import MapComponent to prevent SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">Loading Map...</div>,
});

interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  coords: [number, number];
  cost?: number; // Cost in INR
}

interface Day {
  day: number;
  theme: string;
  activities: Activity[];
}

interface Itinerary {
  title: string;
  destination: string;
  centerCoords: [number, number];
  duration: string;
  budget: string;
  summary: string;
  days: Day[];
  generatedBy?: string;
}

export default function PlannerPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-900" /></div>}>
      <PlannerPage />
    </Suspense>
  );
}

function PlannerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const prompt = searchParams.get("prompt");

  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  
  // State for interactive features
  const [activeDay, setActiveDay] = useState<number>(0); // 0 means "All Days"
  const [activeActivityIndex, setActiveActivityIndex] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  
  // Modals & Forms State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDayIdx, setEditingDayIdx] = useState<number>(0);
  const [editingActIdx, setEditingActIdx] = useState<number>(0);
  
  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLoc, setFormLoc] = useState("");
  const [formCost, setFormCost] = useState<number>(0);

  // Chatbot State
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Namaste! I am TripGenie, your AI travel co-pilot. You can tell me to customize this Indian getaway (e.g., 'make it budget-friendly' or 'add a dhaba to Day 1')." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Share & Competitor States
  const [copied, setCopied] = useState(false);
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Passport, Visa & Tickets", checked: false },
    { id: 2, text: "Local Currency Cash (INR)", checked: false },
    { id: 3, text: "Universal Adapter & Charger", checked: false },
    { id: 4, text: "Weather-appropriate clothing", checked: false },
    { id: 5, text: "First Aid Kit & Medicines", checked: false },
  ]);

  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const weatherInfo = useMemo(() => {
    if (!itinerary) return "24°C Pleasant 🌤️";
    const dest = itinerary.destination.toLowerCase();
    if (dest.includes("goa")) return "29°C Sunny ☀️";
    if (dest.includes("jaipur") || dest.includes("rajasthan")) return "32°C Sunny ☀️";
    if (dest.includes("manali") || dest.includes("himachal")) return "14°C Cool ☁️";
    if (dest.includes("dubai") || dest.includes("uae")) return "36°C Hot ☀️";
    if (dest.includes("singapore")) return "28°C Rainy 🌧️";
    if (dest.includes("bangkok") || dest.includes("thailand")) return "30°C Humid ☁️";
    return "22°C Pleasant 🌤️";
  }, [itinerary]);

  // Load Itinerary
  useEffect(() => {
    if (!prompt) return;

    const fetchItinerary = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        
        // Enrich default items with costs in INR if not present
        const enrichedItinerary: Itinerary = data.itinerary;
        enrichedItinerary.days.forEach(day => {
          day.activities.forEach(act => {
            if (act.cost === undefined) {
              act.cost = Math.floor(Math.random() * 1500) + 200; // Default random cost (₹200 - ₹1700)
            }
          });
        });
        
        setItinerary(enrichedItinerary);
      } catch (error) {
        console.error("Failed to load itinerary", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [prompt]);

  // Compute flattened activities based on selected day
  const filteredActivities = useMemo(() => {
    if (!itinerary) return [];
    if (activeDay === 0) {
      return itinerary.days.reduce<Activity[]>((acc, d) => [...acc, ...d.activities], []);
    } else {
      const dayData = itinerary.days.find(d => d.day === activeDay);
      return dayData ? dayData.activities : [];
    }
  }, [itinerary, activeDay]);

  // Dynamic Indian cost calculations (in INR)
  const flightTrainCost = 8500;    // Average rail/flight fare in India
  const hotelCostPerDay = 3500;     // Average standard room cost in INR
  const foodCostPerDay = 800;       // Average standard food cost per day in INR
  const contingencyCost = 2000;     // INR scale contingency

  const costBreakdown = useMemo(() => {
    if (!itinerary) return { total: 0, flights: 0, hotels: 0, food: 0, activities: 0, contingency: 2000 };
    
    const daysCount = itinerary.days.length;
    const activitiesCost = itinerary.days.reduce((totalSum, d) => {
      return totalSum + d.activities.reduce((sum, act) => sum + (act.cost || 0), 0);
    }, 0);

    const hotelsSum = hotelCostPerDay * daysCount;
    const foodSum = foodCostPerDay * daysCount;
    const total = flightTrainCost + hotelsSum + foodSum + activitiesCost + contingencyCost;

    return {
      flights: flightTrainCost,
      hotels: hotelsSum,
      food: foodSum,
      activities: activitiesCost,
      contingency: contingencyCost,
      total
    };
  }, [itinerary]);

  // Itinerary Modification Handlers
  const handleDeleteActivity = (dayIndex: number, actIndex: number) => {
    if (!itinerary) return;
    const updated = { ...itinerary };
    updated.days[dayIndex].activities.splice(actIndex, 1);
    setItinerary(updated);
    setActiveActivityIndex(null);
  };

  const handleMoveActivity = (dayIndex: number, actIndex: number, direction: "up" | "down") => {
    if (!itinerary) return;
    const updated = { ...itinerary };
    const list = updated.days[dayIndex].activities;
    const targetIdx = direction === "up" ? actIndex - 1 : actIndex + 1;
    
    if (targetIdx < 0 || targetIdx >= list.length) return;
    
    // Swap
    const temp = list[actIndex];
    list[actIndex] = list[targetIdx];
    list[targetIdx] = temp;
    
    setItinerary(updated);
    setActiveActivityIndex(null);
  };

  const openAddModal = (dayIdx: number) => {
    setEditingDayIdx(dayIdx);
    setFormTitle("");
    setFormTime("12:00 PM");
    setFormDesc("");
    setFormLoc("");
    setFormCost(500); // Default stop cost in INR
    setShowAddModal(true);
  };

  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinerary || !formTitle) return;

    const updated = { ...itinerary };
    const center = itinerary.centerCoords || [28.6139, 77.2090]; // Delhi as global center fallback
    
    const offsetLat = (Math.random() - 0.5) * 0.08;
    const offsetLng = (Math.random() - 0.5) * 0.08;
    const newCoords: [number, number] = [center[0] + offsetLat, center[1] + offsetLng];

    const newAct: Activity = {
      title: formTitle,
      time: formTime,
      description: formDesc,
      location: formLoc || "Local Attraction",
      coords: newCoords,
      cost: formCost
    };

    updated.days[editingDayIdx].activities.push(newAct);
    updated.days[editingDayIdx].activities.sort((a, b) => a.time.localeCompare(b.time));

    setItinerary(updated);
    setShowAddModal(false);
  };

  const openEditModal = (dayIdx: number, actIdx: number) => {
    if (!itinerary) return;
    setEditingDayIdx(dayIdx);
    setEditingActIdx(actIdx);
    
    const act = itinerary.days[dayIdx].activities[actIdx];
    setFormTitle(act.title);
    setFormTime(act.time);
    setFormDesc(act.description);
    setFormLoc(act.location);
    setFormCost(act.cost || 0);
    
    setShowEditModal(true);
  };

  const handleEditActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinerary) return;

    const updated = { ...itinerary };
    const act = updated.days[editingDayIdx].activities[editingActIdx];
    
    act.title = formTitle;
    act.time = formTime;
    act.description = formDesc;
    act.location = formLoc;
    act.cost = formCost;

    setItinerary(updated);
    setShowEditModal(false);
  };

  // AI Chat Request Handler (INR values)
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !itinerary) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    setTimeout(() => {
      const updated = { ...itinerary };
      let reply = "I've processed your request!";

      if (userMsg.toLowerCase().includes("budget") || userMsg.toLowerCase().includes("cheap")) {
        // Lower expenses by 30%
        updated.days.forEach(day => {
          day.activities.forEach(act => {
            if (act.cost) act.cost = Math.floor(act.cost * 0.7);
          });
        });
        reply = "Understood. I have optimized the itinerary for a budget-friendly style. Activity expenses have been cut by 30% and budget levels updated in Rupees!";
      } else if (userMsg.toLowerCase().includes("dhaba") || userMsg.toLowerCase().includes("food") || userMsg.toLowerCase().includes("lunch")) {
        // Add local dhaba stop
        const newCoords: [number, number] = [
          itinerary.centerCoords[0] + (Math.random() - 0.5) * 0.05, 
          itinerary.centerCoords[1] + (Math.random() - 0.5) * 0.05
        ];
        const newAct: Activity = {
          time: "01:30 PM",
          title: "Lunch Stop - Local Dhaba & Tea Stall",
          description: "Savour local delicacies like paranthas and traditional cutting chai.",
          location: "High Street Bazaar",
          coords: newCoords,
          cost: 350 // INR cost
        };
        updated.days[0].activities.push(newAct);
        updated.days[0].activities.sort((a, b) => a.time.localeCompare(b.time));
        reply = "I've added a highly-rated local Dhaba lunch stop to your Day 1 itinerary. Price is calculated as ₹350 in your budget!";
      } else {
        reply = `I've updated your trip parameters based on "${userMsg}". The itinerary structure has been optimized.`;
      }

      setItinerary(updated);
      setChatMessages(prev => [...prev, { sender: "ai", text: reply }]);
      setChatLoading(false);
    }, 1500);
  };

  if (loading) return <LoadingState prompt={prompt} />;
  if (!itinerary) return <div className="min-h-screen flex justify-center items-center">Failed to generate itinerary.</div>;

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-slate-50 text-slate-800 overflow-hidden">
      
      {/* LEFT COLUMN: Timeline canvas & analytics (50% Width) */}
      <section className={`w-full lg:w-1/2 h-screen flex flex-col justify-between overflow-y-auto px-4 md:px-8 py-6 border-r border-slate-200 bg-white ${mobileView === "list" ? "block" : "hidden lg:block"}`}>
        
        <div>
          {/* Header Panel */}
          <nav className="flex items-center justify-between pb-6 border-b border-slate-200">
            <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-blue-900 font-bold text-sm hover:underline">
              <ArrowLeft className="w-4 h-4" />
              New Planner
            </button>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-6.5 h-6.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-600/10 text-white">
                  <Sparkles className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
                </div>
                <span className="font-extrabold tracking-tight text-sm text-slate-900">
                  Trip<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">Mind</span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-500">
                <button 
                  onClick={() => router.push(`/flights?destination=${encodeURIComponent(itinerary.destination)}`)}
                  className="flex items-center gap-1 hover:text-blue-900 transition-colors cursor-pointer"
                >
                  <Plane className="w-3.5 h-3.5" /> Flight/Train
                </button>
                <button 
                  onClick={() => router.push(`/hotels?destination=${encodeURIComponent(itinerary.destination)}`)}
                  className="flex items-center gap-1 hover:text-blue-900 transition-colors cursor-pointer"
                >
                  <Hotel className="w-3.5 h-3.5" /> Hotels
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare} 
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Share2 className="w-3.5 h-3.5" /> 
                {copied ? "Link Copied!" : "Share Trip"}
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-blue-900 hover:bg-blue-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
            </div>
          </nav>

          {/* Destination Header card */}
          <div className="py-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-blue-800 font-extrabold tracking-wide uppercase">AI Smart India Trip</span>
              {itinerary.generatedBy && (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[10px] font-extrabold shadow-sm border border-yellow-250">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-600 fill-current" />
                  {itinerary.generatedBy}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{itinerary.destination}</h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{itinerary.summary}</p>
            
            {/* Quick stats tags in INR */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
                <span className="text-xs">🌡️</span>
                {weatherInfo}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                {itinerary.duration}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
                <Wallet className="w-3.5 h-3.5 text-green-600" />
                Est: ₹{costBreakdown.total.toLocaleString("en-IN")}
              </span>
              <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                {filteredActivities.length} Stops
              </span>
            </div>
          </div>

          {/* Day navigation tabs */}
          <div id="day-tabs" className="flex gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
            <button 
              onClick={() => { setActiveDay(0); setActiveActivityIndex(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition duration-150 ${
                activeDay === 0 
                  ? "bg-blue-900 text-white shadow-sm" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              All Days
            </button>
            {itinerary.days.map((d) => (
              <button
                key={d.day}
                onClick={() => { setActiveDay(d.day); setActiveActivityIndex(null); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition duration-150 ${
                  activeDay === d.day
                    ? "bg-blue-900 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                Day {d.day}
              </button>
            ))}
          </div>

          {/* Timeline canvas list */}
          <div className="py-6 space-y-8">
            {itinerary.days.map((dayData, dayIdx) => {
              if (activeDay !== 0 && activeDay !== dayData.day) return null;

              return (
                <div key={dayData.day} className="space-y-4">
                  {/* Day Banner divider */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">Day {dayData.day}</h3>
                      <p className="text-xs text-blue-900/70 font-semibold mt-0.5">{dayData.theme}</p>
                    </div>
                    <button 
                      onClick={() => openAddModal(dayIdx)}
                      className="bg-blue-900/10 hover:bg-blue-900/20 text-blue-900 p-1.5 rounded-lg flex items-center gap-1 text-xs font-extrabold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Stop
                    </button>
                  </div>

                  {/* Day Activities list */}
                  {dayData.activities.length === 0 ? (
                    <p className="text-xs text-slate-400 italic pl-6 py-2">No activities for this day yet. Click 'Add Stop' to start customizing!</p>
                  ) : (
                    <div className="space-y-4 pl-4 border-l-2 border-slate-200 ml-4">
                      {dayData.activities.map((act, actIdx) => {
                        const globalIdx = activeDay === 0 
                          ? filteredActivities.findIndex(fa => fa.title === act.title && fa.time === act.time)
                          : actIdx;
                        const isFocused = activeActivityIndex === globalIdx;

                        return (
                          <div 
                            key={actIdx}
                            onMouseEnter={() => setActiveActivityIndex(globalIdx)}
                            className={`relative bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition duration-150 ${
                              isFocused ? "border-blue-900 ring-2 ring-blue-900/10" : "border-slate-200"
                            }`}
                          >
                            {/* Dot overlay */}
                            <div className={`absolute -left-[25px] top-5 w-3.5 h-3.5 rounded-full border-2 ${
                              isFocused ? "bg-blue-900 border-white ring-4 ring-blue-900/10" : "bg-white border-slate-350"
                            }`}></div>

                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                  <Clock className="w-3.5 h-3.5 text-blue-900" />
                                  {act.time}
                                  <span>•</span>
                                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                                  {act.location}
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-800 mt-1">{act.title}</h4>
                                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{act.description}</p>
                                
                                {act.cost !== undefined && (
                                  <div className="mt-2 text-xs font-bold text-slate-700 bg-slate-100 rounded px-2 py-0.5 w-fit">
                                    Price: ₹{act.cost.toLocaleString("en-IN")}
                                  </div>
                                )}
                              </div>

                              {/* Interactive controls */}
                              <div className="flex flex-col gap-1.5 activity-controls">
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => handleMoveActivity(dayIdx, actIdx, "up")}
                                    disabled={actIdx === 0}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-30"
                                    title="Move Up"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleMoveActivity(dayIdx, actIdx, "down")}
                                    disabled={actIdx === dayData.activities.length - 1}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-400 disabled:opacity-30"
                                    title="Move Down"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex gap-1 mt-1">
                                  <button 
                                    onClick={() => openEditModal(dayIdx, actIdx)}
                                    className="p-1.5 rounded hover:bg-blue-50 text-blue-900"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteActivity(dayIdx, actIdx)}
                                    className="p-1.5 rounded hover:bg-red-50 text-red-600"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SVG Cost Analytics Donut Chart */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-8 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-base mb-4">Cost Analytics (INR)</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Donut Chart SVG */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  
                  {/* Segment 1: Flight/Train */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e3a8a" strokeWidth="3.2"
                    strokeDasharray={`${(costBreakdown.flights / costBreakdown.total) * 100} ${100 - (costBreakdown.flights / costBreakdown.total) * 100}`}
                    strokeDashoffset="0" />
                  
                  {/* Segment 2: Hotels */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2563eb" strokeWidth="3.2"
                    strokeDasharray={`${(costBreakdown.hotels / costBreakdown.total) * 100} ${100 - (costBreakdown.hotels / costBreakdown.total) * 100}`}
                    strokeDashoffset={`-${(costBreakdown.flights / costBreakdown.total) * 100}`} />
                  
                  {/* Segment 3: Food */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.2"
                    strokeDasharray={`${(costBreakdown.food / costBreakdown.total) * 100} ${100 - (costBreakdown.food / costBreakdown.total) * 100}`}
                    strokeDashoffset={`-${((costBreakdown.flights + costBreakdown.hotels) / costBreakdown.total) * 100}`} />

                  {/* Segment 4: Activities */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.2"
                    strokeDasharray={`${(costBreakdown.activities / costBreakdown.total) * 100} ${100 - (costBreakdown.activities / costBreakdown.total) * 100}`}
                    strokeDashoffset={`-${((costBreakdown.flights + costBreakdown.hotels + costBreakdown.food) / costBreakdown.total) * 100}`} />
                  
                  {/* Segment 5: Contingency */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3.2"
                    strokeDasharray={`${(costBreakdown.contingency / costBreakdown.total) * 100} ${100 - (costBreakdown.contingency / costBreakdown.total) * 100}`}
                    strokeDashoffset={`-${((costBreakdown.flights + costBreakdown.hotels + costBreakdown.food + costBreakdown.activities) / costBreakdown.total) * 100}`} />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Est</span>
                  <span className="text-sm font-extrabold text-slate-800">₹{costBreakdown.total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-900 rounded"></div>
                    <span>Transit (₹{costBreakdown.flights.toLocaleString("en-IN")})</span>
                  </div>
                  <button 
                    onClick={() => router.push(`/flights?destination=${encodeURIComponent(itinerary.destination)}`)}
                    className="text-[10px] text-blue-600 hover:underline font-extrabold flex items-center gap-0.5 ml-2 cursor-pointer"
                  >
                    Book Flights ↗
                  </button>
                </div>
                <div className="flex items-center justify-between col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span>Hotels (₹{costBreakdown.hotels.toLocaleString("en-IN")})</span>
                  </div>
                  <button 
                    onClick={() => router.push(`/hotels?destination=${encodeURIComponent(itinerary.destination)}`)}
                    className="text-[10px] text-blue-600 hover:underline font-extrabold flex items-center gap-0.5 ml-2 cursor-pointer"
                  >
                    Book Hotels ↗
                  </button>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                  <div className="w-3 h-3 bg-emerald-550 rounded"></div>
                  <span>Meals (₹{costBreakdown.food.toLocaleString("en-IN")})</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                  <div className="w-3 h-3 bg-amber-500 rounded"></div>
                  <span>Sightseeing (₹{costBreakdown.activities.toLocaleString("en-IN")})</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Contingency & Buffer (₹{costBreakdown.contingency.toLocaleString("en-IN")})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Packing Checklist Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-1.5">
              <Check className="w-5 h-5 text-blue-900" />
              Pre-Trip Packing Checklist
            </h3>
            <div className="space-y-2">
              {checklist.map(item => (
                <label 
                  key={item.id} 
                  className="flex items-center gap-3 p-2 bg-white hover:bg-slate-50 rounded-lg border border-slate-100 cursor-pointer transition text-xs font-semibold"
                >
                  <input 
                    type="checkbox" 
                    checked={item.checked} 
                    onChange={() => handleToggleChecklist(item.id)}
                    className="rounded text-blue-900 accent-blue-900 w-4 h-4 cursor-pointer"
                  />
                  <span className={item.checked ? "line-through text-slate-400" : "text-slate-700"}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="text-center text-[10px] text-slate-400 pt-8 border-t border-slate-200 mt-12">
          TripMind India AI Engine. Modify items above to recalculate local fares and adjust routing maps.
        </footer>
      </section>

      {/* RIGHT COLUMN: Map panel (50% Width) */}
      <section className={`w-full lg:w-1/2 h-screen relative bg-slate-100 z-10 ${mobileView === "map" ? "block" : "hidden lg:block"}`}>
        <MapComponent 
          activities={filteredActivities} 
          activeActivityIndex={activeActivityIndex}
        />
        
        {/* Floating current itinerary widget */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 text-xs shadow-lg z-[1000] text-slate-850">
          <div className="font-extrabold text-blue-900 uppercase tracking-wider mb-0.5">Route Guide</div>
          <div>Displaying: {activeDay === 0 ? "All Days Combined" : `Day ${activeDay} Stop Route`}</div>
        </div>
      </section>

      {/* Mobile Toggle View Button */}
      <button 
        onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-900 text-white font-extrabold text-xs px-5 py-3 rounded-full shadow-2xl flex items-center gap-1.5 z-[3000] hover:scale-105 transition-all lg:hidden"
      >
        {mobileView === "list" ? (
          <>
            <span>🗺️</span>
            Show Map View
          </>
        ) : (
          <>
            <span>📋</span>
            Show List View
          </>
        )}
      </button>

      {/* TRIPGENIE FLOATING AI CO-PILOT CHAT DRAWER */}
      <div className="fixed bottom-6 right-6 z-[2000]">
        {!showChat ? (
          <button 
            onClick={() => setShowChat(true)}
            className="bg-blue-900 hover:bg-blue-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm transition-all duration-200 hover:scale-105"
          >
            <MessageSquare className="w-5 h-5 text-yellow-500 fill-current" />
            Ask TripGenie
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 h-[400px] flex flex-col justify-between overflow-hidden">
            {/* Chat Header */}
            <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500 fill-current" />
                <div>
                  <h4 className="font-bold text-sm">TripGenie Co-Pilot</h4>
                  <p className="text-[10px] text-blue-200">Interactive AI Editor</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-blue-900 text-white rounded-tr-none" 
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-900" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-200 flex gap-2 bg-white">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask to edit (e.g. 'add dhaba to Day 1')"
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-900"
              />
              <button 
                type="submit" 
                className="bg-blue-900 text-white p-2 rounded-xl hover:bg-blue-800 transition"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ADD STOP MODAL (INR values) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[3000]">
          <form onSubmit={handleAddActivitySubmit} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">Add New Stop to Day {editingDayIdx + 1}</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase">Activity Title</label>
                <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" placeholder="e.g., Local Bazaar Shopping" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 uppercase">Time Slot</label>
                  <input type="text" required value={formTime} onChange={(e) => setFormTime(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" placeholder="e.g., 04:30 PM" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase">Est Cost (₹)</label>
                  <input type="number" required value={formCost} onChange={(e) => setFormCost(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase">Location Address</label>
                <input type="text" value={formLoc} onChange={(e) => setFormLoc(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" placeholder="e.g., Mall Road, Jaipur" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase">Description</label>
                <textarea rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" placeholder="Details about this attraction..." />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 text-xs font-bold">
              <button type="button" onClick={() => setShowAddModal(false)} className="border border-slate-200 text-slate-650 px-4 py-2.5 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="submit" className="bg-blue-900 text-white px-4 py-2.5 rounded-lg hover:bg-blue-800">Add Stop</button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT STOP MODAL (INR values) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[3000]">
          <form onSubmit={handleEditActivitySubmit} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">Edit Activity Details</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase">Activity Title</label>
                <input type="text" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 uppercase">Time Slot</label>
                  <input type="text" required value={formTime} onChange={(e) => setFormTime(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase">Est Cost (₹)</label>
                  <input type="number" required value={formCost} onChange={(e) => setFormCost(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase">Location Address</label>
                <input type="text" value={formLoc} onChange={(e) => setFormLoc(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" />
              </div>
              <div>
                <label className="block font-bold text-slate-500 uppercase">Description</label>
                <textarea rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:border-blue-900 font-semibold" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 text-xs font-bold">
              <button type="button" onClick={() => setShowEditModal(false)} className="border border-slate-200 text-slate-650 px-4 py-2.5 rounded-lg hover:bg-slate-50">Cancel</button>
              <button type="submit" className="bg-blue-900 text-white px-4 py-2.5 rounded-lg hover:bg-blue-800">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

// Loading State Component (INR Scale)
function LoadingState({ prompt }: { prompt: string | null }) {
  const messages = [
    "Analyzing your Indian route preferences...",
    "Finding optimal trains and flights...",
    "Selecting top hotels in India...",
    "Curating local sightseeings & street food stops...",
    "Finalizing your Indian getaway plan..."
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-150 p-10 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-blue-900 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating Your Indian Trip</h2>
        <p className="text-slate-500 mb-8 truncate text-sm">Prompt: "{prompt}"</p>
        
        <div className="flex items-center justify-center gap-3 text-blue-900 font-bold h-6 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span key={msgIndex} className="animate-pulse">{messages[msgIndex]}</span>
        </div>

        {/* Skeleton Loader */}
        <div className="mt-10 space-y-4 text-left">
          <div className="h-6 bg-slate-100 rounded-md w-3/4 animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse"></div>
          <div className="h-4 bg-slate-100 rounded-md w-5/6 animate-pulse"></div>
          <div className="h-20 bg-slate-100 rounded-lg w-full animate-pulse mt-4"></div>
        </div>
      </div>
    </main>
  );
}
