"use client";

import { useContext, useEffect, useState } from "react";
import { Context } from "../../../_components/ContextProvider";
import { useRouter } from "next/navigation";
import { Search, User, History } from "lucide-react";
import PopEffect from "../../../_components/PopEffect";
import AgentProfile from "./AgentProfile";
import AgentHistory from "../../history/page.jsx";
import { AnimatePresence } from "framer-motion";
import "intro.js/introjs.css";

type Hotel = {
  name: string;
  location: string;
  url: string;
};

const waitForElement = (selector: string, timeout = 3000): Promise<void> => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (document.querySelector(selector)) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
    setTimeout(() => clearInterval(interval), timeout);
  });
};
const AgentNav = ({ hotels = [] }: { hotels?: Hotel[] }) => {
  const { user } = useContext(Context);
  const navigate = useRouter();
  const [pr, setPr] = useState(false);
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState(false);
    const [tourStarted, setTourStarted] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "agent") {
      navigate.push("/");
    }
  }, [user, navigate]);

  const filteredHotels = hotels.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase())
  );
   const startAgentTour = async () => {
    const introJs = (await import("intro.js")).default;
    const intro = introJs();

    await waitForElement("input[type='text']");
    await waitForElement(".history-btn");
    await waitForElement(".hotel-box");

    intro.setOptions({
      steps: [
        {
          element: "input[type='text']",
          intro: "🔍 Use this search to find hotels by name or location.",
          position: "bottom",
        },
        {
          element: ".history-btn",
          intro: "📖 Click to view your booking history.",
          position: "bottom",
        },
        {
          element: ".hotel-box",
          intro:
            "🌐 Click on any hotel url to view and manage bookings in its calendar.",
          position: "bottom" ,
        },
      ],
      scrollToElement: true,
      exitOnOverlayClick: false,
      exitOnEsc: false,
      showButtons: true,
      showProgress: true,
      disableInteraction: true,
    });

    intro.start();
    setTourStarted(true);
  };
  useEffect(() => {
  const hasSeenAgentTour = localStorage.getItem("has_seen_agentnav_tour");
  if (!hasSeenAgentTour) {
    localStorage.setItem("has_seen_agentnav_tour", "true");
    startAgentTour();
  }
}, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b shadow-md">
        <img
          src="/svgs/logo.png"
          alt="BookingList"
          className="h-10 w-auto object-contain cursor-pointer"
        />

        <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
          <Search className="text-gray-500" />
          <input
            type="text"
            placeholder="Search hotel or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex items-center gap-5">
          <User
            onClick={() => setPr(true)}
            className=" w-6 h-6 text-gray-700 hover:text-blue-800 cursor-pointer"
          />
          <History
            onClick={() => setShowHistory(true)}
            aria-label="View History"
            className="history-btn w-6 h-6 text-gray-700 hover:text-blue-800 cursor-pointer"
          />
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredHotels.length > 0 ? (
          filteredHotels.map((hotel, i) => (
            <div
              key={i}
              onClick={() => {
                  if (!localStorage.getItem("has_seen_calendar_tour")) {
                        localStorage.setItem("calendar_grid_tour", "true");
                  }
                  navigate.push(`/agent/dashboard/${hotel.url}`);
                }}
              className="border rounded-lg p-4 bg-gray shadow hover:shadow-md cursor-pointer transition duration-200"
            >
              <h3 className="text-lg font-bold text-gray-900"> {hotel.name}</h3>
              <p className="text-gray-600"> 📍Location :{hotel.location}</p>
              <p className="hotel-box text-blue-600 text-sm truncate">
                {" "}
                🌐URL :{hotel.url}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full py-8">
            {search ? "No matching hotels found." : "No hotels available."}
          </p>
        )}
      </div>
      <AnimatePresence>
        {pr && (
          <PopEffect cb={() => setPr(false)}>
            <div className="flex flex-col items-center gap-10">
              <AgentProfile />
            </div>
          </PopEffect>
        )}
        {showHistory && (
          <PopEffect cb={() => setShowHistory(false)}>
            <div className="flex flex-col items-center gap-10 max-w-4xl w-full">
              <AgentHistory />
            </div>
          </PopEffect>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentNav;
