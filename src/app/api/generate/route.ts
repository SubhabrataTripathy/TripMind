import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt: string };
    const cleanPrompt = prompt.toLowerCase();

    const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";
    const apiKey = process.env.OPENROUTER_API_KEY;

    const systemPrompt = `You are an expert AI Travel Agent specializing in Indian and popular international getaways for Indian travelers. Your task is to generate a highly detailed and realistic day-by-day travel plan based on the user's prompt.
You MUST output your response strictly as a single JSON object.
Do not wrap your response in markdown code blocks (do not use \`\`\`json). Output ONLY the raw JSON string.

CRITICAL INSTRUCTIONS:
1. CURRENCY: All budgets, activity costs, and ticket rates MUST be estimated strictly in Indian Rupees (INR) using the ₹ symbol or pure numbers. Do not use US Dollars ($).
2. SIGHTSEEING & SERVICES: Incorporate local experiences (e.g. local markets, malls, theme parks, city tours, landmarks, local dining, cabs, metro routes).
3. COORDINATES: Provide actual, realistic coordinates ([lat, lng]) for the destination center and each individual activity so they plot accurately on the map.

The JSON schema MUST exactly match:
{
  "title": "String title for the trip (e.g. Modern Marvels in Singapore)",
  "destination": "String name of the city, state, country (e.g. Singapore)",
  "centerCoords": [latitude_number, longitude_number],
  "duration": "String duration (e.g. '5 Days')",
  "budget": "String budget estimate in INR (e.g. '₹45,000 - ₹65,000')",
  "summary": "String summary of the trip",
  "days": [
    {
      "day": 1,
      "theme": "String theme of the day",
      "activities": [
        {
          "time": "String time slot (e.g. '10:00 AM')",
          "title": "String name of activity/landmark/bazaar",
          "description": "String details of what to see, do or eat there",
          "location": "String local neighborhood/area name",
          "coords": [latitude_number, longitude_number],
          "cost": number (estimated cost in Indian Rupees as a number, e.g. 500, or 0 if free)
        }
      ]
    }
  ]
}`;

    try {
      const response = await fetch(openRouterUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "TripMind",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemma-4-26b-a4b-it:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate an Indian holiday or international tour itinerary for: "${prompt}"` }
          ]
        })
      });

      if (response.ok) {
        const resData = await response.json();
        let assistantContent = resData.choices?.[0]?.message?.content || "";
        
        if (assistantContent.includes("```")) {
          assistantContent = assistantContent
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        }

        const parsedItinerary = JSON.parse(assistantContent);

        if (parsedItinerary.destination && Array.isArray(parsedItinerary.days)) {
          parsedItinerary.days.forEach((day: any) => {
            if (Array.isArray(day.activities)) {
              day.activities.forEach((act: any) => {
                if (act.cost === undefined || isNaN(Number(act.cost))) {
                  act.cost = 350; 
                }
                if (!Array.isArray(act.coords) || act.coords.length < 2) {
                  const base = parsedItinerary.centerCoords || [28.6139, 77.2090];
                  act.coords = [base[0] + (Math.random() - 0.5) * 0.05, base[1] + (Math.random() - 0.5) * 0.05];
                }
              });
            }
          });

          parsedItinerary.generatedBy = "Google Gemma 4 26B (OpenRouter)";
          return NextResponse.json({ itinerary: parsedItinerary });
        }
      } else {
        console.warn("OpenRouter API returned non-200 status:", response.status, await response.text());
      }
    } catch (apiError) {
      console.error("OpenRouter API failed, using local generator:", apiError);
    }

    // FALLBACK PROCEDURAL GENERATOR (DOMESTIC & INTERNATIONAL)
    let destination = "Goa, India";
    let centerCoords: [number, number] = [15.2993, 74.1240];
    let duration = "4 Days";
    let budget = "₹12,000 - ₹18,000";
    let summary = "A beach holiday combining historical Portuguese forts, vibrant local markets, shacks and fresh seafood.";
    let days = [];

    // DUBAI UAE FALLBACK
    if (cleanPrompt.includes("dubai") || cleanPrompt.includes("uae") || cleanPrompt.includes("emirates")) {
      destination = "Dubai, UAE";
      centerCoords = [25.2048, 55.2708];
      duration = "5 Days";
      budget = "₹48,000 - ₹65,000";
      summary = "Experience the luxurious modern marvels of Dubai, featuring skyscrapers, massive shopping malls, desert safaris, and traditional spice bazaars.";
      days = [
        {
          day: 1,
          theme: "Arrival & Marina Dhow Cruise",
          activities: [
            { time: "01:00 PM", title: "Arrive at Dubai Airport (DXB)", description: "Transfer to hotel in Downtown Dubai.", location: "Airport Terminal 3", coords: [25.2532, 55.3657], cost: 1500 },
            { time: "03:00 PM", title: "Hotel Check-in & Relax", description: "Check in at Millennium Plaza Hotel.", location: "Sheikh Zayed Road", coords: [25.2163, 55.2798], cost: 0 },
            { time: "07:30 PM", title: "Marina Dhow Dinner Cruise", description: "Buffet dinner aboard a traditional wooden boat with illuminated skyline views.", location: "Dubai Marina", coords: [25.0799, 55.1398], cost: 2800 }
          ]
        },
        {
          day: 2,
          theme: "Burj Khalifa & Modern Marvels",
          activities: [
            { time: "09:30 AM", title: "Burj Khalifa (At the Top)", description: "Fly up to the 124th-floor observation deck for sweeping views.", location: "Downtown Dubai", coords: [25.1972, 55.2744], cost: 3800 },
            { time: "01:00 PM", title: "Dubai Mall & Aquarium", description: "Lunch and visit the massive underwater zoo.", location: "Dubai Mall", coords: [25.1985, 55.2796], cost: 2000 },
            { time: "06:00 PM", title: "Dubai Fountain Show", description: "Watch the world's largest choreographed fountain system dance to music.", location: "Burj Lake", coords: [25.1960, 55.2750], cost: 0 }
          ]
        },
        {
          day: 3,
          theme: "Desert Safari Adventure",
          activities: [
            { time: "10:00 AM", title: "Old Dubai & Gold Souk Walk", description: "Take an abra boat ride across the creek to explore gold and spice markets.", location: "Deira", coords: [25.2730, 55.2995], cost: 200 },
            { time: "03:30 PM", title: "4x4 Desert Dune Bashing", description: "Dune bashing, camel riding, sandboarding, and Tanoura dancing with BBQ dinner.", location: "Lahbab Desert", coords: [24.9750, 55.5900], cost: 2500 }
          ]
        }
      ];
    } 
    // SINGAPORE FALLBACK
    else if (cleanPrompt.includes("singapore")) {
      destination = "Singapore";
      centerCoords = [1.3521, 103.8198];
      duration = "5 Days";
      budget = "₹55,000 - ₹75,000";
      summary = "Immerse in the green, high-tech garden city of Singapore. Features Universal Studios, Sentosa Island, and futuristic Garden domes.";
      days = [
        {
          day: 1,
          theme: "Arrival & Gardens by the Bay",
          activities: [
            { time: "10:30 AM", title: "Arrive at Changi Airport", description: "Fast transit check-in. Explore Jewel Changi waterfall.", location: "Changi", coords: [1.3644, 103.9915], cost: 500 },
            { time: "02:00 PM", title: "Hotel Check-in", description: "Settle in at Furama RiverFront Hotel.", location: "Havelock Road", coords: [1.2885, 103.8361], cost: 0 },
            { time: "04:30 PM", title: "Gardens by the Bay", description: "Walk the Supertree Grove and visit the Flower Dome and Cloud Forest.", location: "Marina Bay", coords: [1.2816, 103.8636], cost: 2200 },
            { time: "07:45 PM", title: "Garden Rhapsody Light Show", description: "Watch the massive supertrees light up in choregraphy.", location: "Gardens by the Bay", coords: [1.2820, 103.8640], cost: 0 }
          ]
        },
        {
          day: 2,
          theme: "Sentosa & Universal Studios",
          activities: [
            { time: "09:30 AM", title: "Universal Studios Singapore", description: "Spend a full day enjoying themed rides, shows, and attractions.", location: "Sentosa Island", coords: [1.2541, 103.8238], cost: 4800 },
            { time: "06:00 PM", title: "Sentosa Beach Walk & Sunset", description: "Walk along Siloso Beach and enjoy a seaside dinner.", location: "Sentosa Beach", coords: [1.2502, 103.8166], cost: 1200 }
          ]
        },
        {
          day: 3,
          theme: "Chinatown & Night Safari",
          activities: [
            { time: "10:00 AM", title: "Buddha Tooth Relic Temple", description: "Visit the stunning Chinatown landmark temple.", location: "Chinatown", coords: [1.2818, 103.8443], cost: 0 },
            { time: "12:00 PM", title: "Lunch at Maxwell Food Centre", description: "Try the world-famous Tian Tian Hainanese Chicken Rice.", location: "Chinatown", coords: [1.2805, 103.8447], cost: 450 },
            { time: "07:30 PM", title: "Singapore Night Safari", description: "Open-air tram ride through nocturnal animal habitats.", location: "Mandai", coords: [1.4022, 103.7880], cost: 3200 }
          ]
        }
      ];
    }
    // BANGKOK THAILAND FALLBACK
    else if (cleanPrompt.includes("bangkok") || cleanPrompt.includes("thailand") || cleanPrompt.includes("phuket")) {
      destination = "Bangkok, Thailand";
      centerCoords = [13.7563, 100.5018];
      duration = "4 Days";
      budget = "₹28,000 - ₹38,000";
      summary = "Experience the vibrant street life, historic golden temples, busy canals, and shopping night markets of Bangkok.";
      days = [
        {
          day: 1,
          theme: "Grand Palace & Riverside Temples",
          activities: [
            { time: "11:00 AM", title: "Arrive at Suvarnabhumi Airport (BKK)", description: "Airport Rail Link train to city center.", location: "Bangkok", coords: [13.6899, 100.7501], cost: 200 },
            { time: "02:00 PM", title: "Visit Wat Phra Kaew & Grand Palace", description: "See the spectacular Emerald Buddha and Royal courts.", location: "Grand Palace", coords: [13.7516, 100.4927], cost: 1200 },
            { time: "04:30 PM", title: "Wat Arun (Temple of Dawn)", description: "Cross the Chao Phraya river by boat to see the iconic porcelain spire.", location: "Riverside", coords: [13.7437, 100.4889], cost: 100 },
            { time: "07:00 PM", title: "Chinatown Street Food Feast", description: "Savour local Pad Thai and seafood from street stalls.", location: "Yaowarat Road", coords: [13.7410, 100.5080], cost: 500 }
          ]
        },
        {
          day: 2,
          theme: "Shopping & Night Markets",
          activities: [
            { time: "10:00 AM", title: "Chatuchak Weekend Market", description: "Browse the massive market containing thousands of local stalls.", location: "Chatuchak", coords: [13.7999, 100.5506], cost: 0 },
            { time: "03:00 PM", title: "Siam Paragon Shopping", description: "Shop and chill inside one of Asia's largest luxury malls.", location: "Pathum Wan", coords: [13.7461, 100.5350], cost: 0 },
            { time: "06:30 PM", title: "Asiatique The Riverfront", description: "Enjoy dining, Ferris wheel views, and night bazaar shopping along the river.", location: "Charoen Krung", coords: [13.7047, 100.5029], cost: 1000 }
          ]
        }
      ];
    }
    // JAIPUR FALLBACK
    else if (cleanPrompt.includes("jaipur") || cleanPrompt.includes("rajasthan")) {
      destination = "Jaipur, Rajasthan, India";
      centerCoords = [26.9124, 75.7873];
      duration = "4 Days";
      budget = "₹10,000 - ₹16,500";
      summary = "Explore the majesty of the Pink City, filled with royal palaces, ancient astronomy instruments, vibrant bazaars, and rich Rajasthani heritage.";
      days = [
        {
          day: 1,
          theme: "Royal Palaces & Old City",
          activities: [
            { time: "09:30 AM", title: "City Palace Tour", description: "Explore the royal residence, courtyards, and museum collections.", location: "Old City", coords: [26.9258, 75.8237], cost: 300 },
            { time: "12:00 PM", title: "Hawa Mahal", description: "Photograph the iconic honeycombed pink sandstone facade.", location: "Badi Choupad", coords: [26.9239, 75.8267], cost: 50 },
            { time: "01:30 PM", title: "Lunch at Laxmi Mishthan Bhandar", description: "Relish standard Rajasthani Dal Baati Churma.", location: "Johari Bazaar", coords: [26.9218, 75.8284], cost: 450 },
            { time: "03:30 PM", title: "Shopping in Bapu Bazaar", description: "Shop for traditional mojris, textiles, and handicrafts.", location: "Bapu Bazaar", coords: [26.9158, 75.8214], cost: 0 }
          ]
        },
        {
          day: 2,
          theme: "Forts & Astronomical Sights",
          activities: [
            { time: "09:00 AM", title: "Amer Fort Excursion", description: "Explore the massive fort complex overlooking Maota Lake.", location: "Amer Town", coords: [26.9855, 75.8513], cost: 150 },
            { time: "01:30 PM", title: "Jantar Mantar Observatory", description: "Examine the UNESCO-listed stone astronomical instruments.", location: "Amer Road", coords: [26.9268, 75.8220], cost: 200 },
            { time: "04:30 PM", title: "Sunset at Nahargarh Fort", description: "View the panoramic sunset over the entire Jaipur city.", location: "Nahargarh Hills", coords: [26.9374, 75.8156], cost: 100 }
          ]
        }
      ];
    }
    // MANALI FALLBACK
    else if (cleanPrompt.includes("manali") || cleanPrompt.includes("himachal")) {
      destination = "Manali, Himachal Pradesh, India";
      centerCoords = [32.2396, 77.1887];
      duration = "4 Days";
      budget = "₹14,000 - ₹22,000";
      summary = "A refreshing Himalayan escape featuring pine-clad valleys, adventure sports, old wood temples, and mountain views.";
      days = [
        {
          day: 1,
          theme: "Local Solace & Old Manali Walk",
          activities: [
            { time: "10:00 AM", title: "Hadimba Devi Temple", description: "Visit the wooden pagoda-style temple nestled in dhungri pine forest.", location: "Dhungri Forest", coords: [32.2471, 77.1795], cost: 0 },
            { time: "01:00 PM", title: "Lunch at Old Manali Cafes", description: "Enjoy trout fish or woodfire pizza in a riverside hippie cafe.", location: "Old Manali", coords: [32.2530, 77.1780], cost: 500 },
            { time: "03:30 PM", title: "Walk along Mall Road", description: "Stroll the central boulevard, shop for Himachali shawls and wooden crafts.", location: "Mall Road", coords: [32.2426, 77.1865], cost: 0 }
          ]
        },
        {
          day: 2,
          theme: "Adventure in Solang Valley",
          activities: [
            { time: "09:00 AM", title: "Drive to Solang Valley", description: "Head out for adventure sports and high peaks.", location: "Solang Valley", coords: [32.3160, 77.1596], cost: 600 },
            { time: "11:00 AM", title: "Paragliding & Zorbing", description: "Experience flying over the Himalayan valley.", location: "Solang Adventure Park", coords: [32.3180, 77.1585], cost: 1500 }
          ]
        }
      ];
    }
    // GOA FALLBACK (DEFAULT)
    else {
      days = [
        {
          day: 1,
          theme: "Arrival & Beach Sunset",
          activities: [
            { time: "11:00 AM", title: "Arrive at Mopa Airport (GOX)", description: "Airport pre-paid taxi transfer to resort.", location: "Pernem", coords: [15.7333, 73.8647], cost: 1200 },
            { time: "02:00 PM", title: "Resort Check-in", description: "Settle into your room near Calangute beach.", location: "Calangute", coords: [15.5442, 73.7624], cost: 0 },
            { time: "05:00 PM", title: "Sunset at Aguada Fort", description: "Explore the 17th-century lighthouse fort.", location: "Sinquerim", coords: [15.4925, 73.7739], cost: 50 },
            { time: "08:00 PM", title: "Seafood Shack Dinner", description: "Enjoy garlic butter prawns and local drinks at a beach shack.", location: "Baga Beach", coords: [15.5553, 73.7517], cost: 800 }
          ]
        },
        {
          day: 2,
          theme: "Heritage & Spice Gardens",
          activities: [
            { time: "09:30 AM", title: "Old Goa Churches", description: "Visit the Basilica of Bom Jesus containing St. Francis Xavier relics.", location: "Old Goa", coords: [15.5009, 73.9116], cost: 0 },
            { time: "12:30 PM", title: "Spice Plantation Tour & Lunch", description: "Walk through vanilla, cardamom plantations. Enjoy buffet on banana leaf.", location: "Ponda", coords: [15.4056, 74.0150], cost: 500 }
          ]
        }
      ];
    }

    const itinerary = {
      title: `AI Generated Trip: ${prompt.substring(0, 30)}...`,
      destination,
      centerCoords,
      duration,
      budget,
      summary,
      days,
      generatedBy: "TripMind Local Fallback Engine"
    };

    return NextResponse.json({ itinerary });
  } catch (error) {
    console.error("Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate trip" }, { status: 500 });
  }
}
