"use client";
import "intro.js/introjs.css";
import { useState, useContext, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfDay,
  addDays,
} from "date-fns";
import {
  CalendarDays,
  User,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  CalendarCheck,
  CalendarX,
  Bed,
  Home,
  LogOut,
  MessageCircle,
  BedDouble,
} from "lucide-react";
import ProfileModal from "./ProfileModal";
import { useRouter } from "next/navigation";
import PopEffect from "../../_components/PopEffect";
import { Context } from "../../_components/ContextProvider.tsx";
import RoomsPricing from "./RoomsPricing";
import { imgurl, postReq, site } from "../../_utils/request.ts";
const waitForElement = (selector, timeout = 3000) =>
  new Promise((resolve) => {
    const interval = setInterval(() => {
      if (document.querySelector(selector)) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
    setTimeout(() => clearInterval(interval), timeout);
  });
export default function TopBar({
  selectedDate,
  setSelectedDate,
  searchBID,
  setSearchBID,
  setSearchTrigger,
  calendarRef,
}) {
  const {
    hosthotel,
    setUser,
    setHosthotel,
    pending,
    socket,
    setPending,
    user,
  } = useContext(Context);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRoomsPricing, setShowRoomsPricing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNot, setShowNot] = useState(false);
  const [showNoRoomModal, setShowNoRoomModal] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const navigate = useRouter();
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const toggleCalendar = () => setShowCalendar((prev) => !prev);
  const toggleSideMenu = () => setShowSideMenu((prev) => !prev);
  const toggleSearch = () => setSearchOpen((prev) => !prev);
  const handleBookingDecision = async (id, res) => {
    if (socket) {
      socket.emit("pending", { id, res });
    } else {
      const res = await postReq(
        site + "guestbooking/pending",
        { _id: id, res },
        user.token
      );
      if (res.success) {
        setPending((p) => p.filter((el) => el._id !== id));
      }
    }
  };
  const isSelected = (day) =>
    format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
  const goToPreviousMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(prev);
  };
  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handleToday = () => {
    setSelectedDate(startOfDay(new Date()));
    setShowSideMenu(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("yolo");

    setSearchOpen(false);
    setSearchTrigger((prev) => prev + 1);
  };

  const openProfile = () => {
    setShowProfile(true);
    setShowSideMenu(false);
  };
  const startTour = async () => {
    try {
      const introJs = (await import("intro.js")).default;
      await Promise.all([
        waitForElement(".calendar-btn"),
        waitForElement(".search-icon"),
        waitForElement(".side-menu-btn"),
        waitForElement(".Not-icon"),
      ]);

      const tour = introJs();
      tour.setOptions({
        steps: [
          {
            element: ".calendar-btn",
            intro: `<strong>Select a date</strong> to view or create bookings for that day.`,
            position: "bottom",
          },
          {
            element: ".search-icon",
            intro: `<strong>Search by Booking ID</strong> quickly using this search bar.`,
            position: "left",
          },
          {
            element: ".side-menu-btn",
            intro: `<strong>Open the sidebar</strong> for quick navigation like check-in, check-out,today's bookings and Rooms &.`,
            position: "bottom",
          },
          {
            element: ".Not-icon",
            intro: `<strong>View pending booking requests</strong> and respond to them easily.`,
            position: "left",
          },
        ],
        tooltipClass: "custom-introjs-tooltip",
        highlightClass: "custom-introjs-highlight",
        showProgress: true,
        scrollToElement: true,
        showBullets: false,
        exitOnOverlayClick: true,
        disableInteraction: true,
      });
      tour.oncomplete(() => {
        localStorage.setItem("tour_completed", "true");
        localStorage.setItem("calendar_tour_trigger", "true");
        calendarRef.current.startTour();
      });

      tour.onexit(() => {
        localStorage.setItem("tour_completed", "true");
        localStorage.setItem("calendar_tour_trigger", "true");
        calendarRef.current.startTour();
      });
      tour.start();
    } catch (error) {
      console.error("Tour failed to start:", error);
    }
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasRoomData =
      hosthotel?.room_cat?.length > 0 || hosthotel?.per_person_cat?.length > 0;
    if (!hasRoomData) return;
    if (!localStorage.getItem("tour_completed")) {
      const timer = setTimeout(() => {
        console.log("Starting TopBar tour");
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  useEffect(() => {
    const hasRoomData =
      hosthotel?.room_cat?.length > 0 || hosthotel?.per_person_cat?.length > 0;

    if (hosthotel && !hasRoomData) {
      setShowNoRoomModal(true);
    }
  }, [hosthotel]);
  useEffect(() => {
    if (socket) {
      socket.on("new-booking", (bok) => {
        setPending((p) => [...p, bok]);
      });

      socket.on("clear-booking", ({ bid }) => {
        setPending((p) => p.filter((el) => el._id !== bid));
      });

      socket.on("pen-success", ({ id }) => {
        setPending((p) => p.filter((el) => el._id !== id));
      });

      socket.on("ss", (bok) => {
        setPending((p) => {
          let copy = p.filter((el) => el._id !== bok._id);
          return [...copy, bok];
        });
      });
    }
    return () => {
      if (socket) {
        socket.off("new-booking");
        socket.off("pen-success");
        socket.off("ss");
        socket.off("clear-booking");
      }
    };
  }, [socket]);

  return (
    <div className="w-full px-6 py-4 flex items-center justify-between bg-white shadow-md z-50 relative">
      <div className="flex items-center gap-4">
        <img
          src="/svgs/logo.png"
          alt="BookingList"
          className="h-10 w-auto object-contain"
        />
      </div>
      <div className="relative">
        <button
          onClick={toggleCalendar}
          className="calendar-btn flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          title="Select Date"
        >
          <CalendarDays className="text-gray-600" size={20} />
          <span className="font-medium text-black">
            {format(selectedDate, "dd MMM yyyy")}
          </span>
        </button>

        {showCalendar && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-80 bg-white border rounded-lg shadow-xl p-4 z-50">
            <div className="flex justify-between items-center mb-4">
              <ChevronLeft
                onClick={goToPreviousMonth}
                className="cursor-pointer text-gray-700 hover:text-black"
                title="Previous Month"
              />
              <div className="text-lg font-semibold text-black">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <ChevronRight
                onClick={goToNextMonth}
                className="cursor-pointer text-gray-700 hover:text-black"
                title="Next Month"
              />
            </div>

            <div className="grid grid-cols-7 text-center text-sm text-black font-semibold mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 text-center gap-y-2 text-sm text-black">
              {Array.from({
                length: new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  1
                ).getDay(),
              }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {daysInMonth.map((day) => (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDate(day);
                    setShowCalendar(false);
                  }}
                  className={`rounded-full w-8 h-8 mx-auto ${
                    isSelected(day)
                      ? "bg-green-500 text-white"
                      : "hover:bg-gray-200 text-black"
                  }`}
                  title={format(day, "eeee, MMMM d, yyyy")}
                >
                  {format(day, "d")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Search Icon & Form */}
        <div className="relative">
          <Search
            onClick={toggleSearch}
            className="search-icon text-gray-700 hover:text-black cursor-pointer"
            size={24}
            title="Search Booking ID"
          />
          {searchOpen && (
            <form
              onSubmit={handleSearchSubmit}
              className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg p-2 flex items-center gap-2 z-50"
            >
              <input
                type="text"
                value={searchBID}
                onChange={(e) => setSearchBID(e.target.value)}
                placeholder="Enter Booking ID"
                className="border border-gray-300 rounded px-2 py-1 text-sm text-black"
                autoFocus
              />
              <button
                type="submit"
                className="bg-green-500 text-black px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Search
              </button>
            </form>
          )}
        </div>

        {/* Bell Notification Icon */}
        <div className="relative">
          <Bell
            onClick={() => setShowNot((prev) => !prev)}
            className="Not-icon text-gray-700 hover:text-black cursor-pointer"
            size={24}
            title="Notifications"
          />
          {pending && pending.length > 0 && (
            <span
              onClick={() => setShowNot((prev) => !prev)}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {pending.length}
            </span>
          )}
        </div>
        <MoreVertical
          onClick={toggleSideMenu}
          className=" side-menu-btn text-gray-700 hover:text-black cursor-pointer"
          size={24}
          title="Menu"
        />
        {showSideMenu && (
          <div className="absolute right-0 top-16 w-64 bg-white shadow-xl rounded-r-lg border-t border-r border-b border-gray-200 z-50">
            <div className="p-4 space-y-2">
              <button
                onClick={openProfile}
                className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-lg text-left text-black"
              >
                <User size={18} className="text-blue-600" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => {
                  navigate.push("/calendar/checkin");
                }}
                className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-black"
              >
                <CalendarCheck size={18} className="text-green-600" />
                <span>Check In</span>
              </button>
              <button
                onClick={() => {
                  navigate.push("/calendar/checkout");
                }}
                className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-black"
              >
                <CalendarX size={18} className="text-red-600" />
                <span>Check Out</span>
              </button>
              <button
                onClick={() => navigate.push("/calendar/tb")}
                className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-black"
              >
                <Bed size={18} className="text-indigo-600" />
                <span>Today's booking</span>
              </button>

              <button
                onClick={() => {
                  setShowRoomsPricing(true);
                  setShowSideMenu(false);
                }}
                className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-black"
              >
                <Home size={18} className="text-purple-600" />
                <span>Rooms & Pricing</span>
              </button>
              <button
                onClick={() => {
                  setUser(null);
                  setHosthotel(null);
                  localStorage.removeItem("tok");
                  navigate.push("/login");
                }}
                className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-red-600"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {showProfile && (
        <ProfileModal
          profile={hosthotel}
          onClose={() => setShowProfile(false)}
        />
      )}
      {showRoomsPricing && (
        <PopEffect cb={() => setShowRoomsPricing(false)}>
          <div className="bg-white p-4 rounded-md shadow-md max-w-xl w-full">
            <RoomsPricing pricingType={hosthotel?.pricingType} />
          </div>
        </PopEffect>
      )}

      {showNot && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowNot(false)}
          />
          <div
            className={`
              fixed md:absolute
              top-16 md:top-full
              right-0
              w-full md:w-96
              h-[calc(100vh-4rem)] md:h-auto
              bg-white border-l border-t md:border-t-0 shadow-lg z-50
              overflow-y-auto
              rounded-t-lg md:rounded-l-lg md:rounded-t-none
              p-4 space-y-4
              transform
              ${
                showNot
                  ? "translate-y-0 md:translate-x-0"
                  : "translate-y-full md:translate-y-0 md:translate-x-full"
              }
              transition-transform duration-300 ease-in-out
            `}
          >
            <div className="flex justify-between items-center pb-2 border-b">
              <h2 className="text-lg font-bold">Pending Requests</h2>
              <button
                onClick={() => setShowNot(false)}
                className="p-1 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>
            {pending?.length > 0 ? (
              <div className="space-y-3">
                {pending.map((bk) => (
                  <div
                    key={bk._id}
                    className="border p-3 rounded shadow-sm bg-gray-50"
                  >
                    <div className="font-semibold truncate">{bk.name}</div>
                    <div className="flex gap-1 items-center text-sm text-gray-700">
                      <span className="text-blue-900">
                        <CalendarDays size={20} />
                      </span>{" "}
                      {format(new Date(bk.fromDate), "dd MMM")} →{" "}
                      {format(new Date(addDays(bk.toDate, 1)), "dd MMM")}
                    </div>
                    <div className="flex gap-1 items-center text-sm text-gray-700">
                      <span className="text-blue-900">
                        <MessageCircle size={20} />
                      </span>{" "}
                      {bk.whatsapp}
                    </div>
                    <div className="flex gap-1 items-center text-sm text-gray-700 truncate">
                      <span className="text-blue-900">
                        <BedDouble size={20} />
                      </span>{" "}
                      {bk.rooms.join(", ")}
                    </div>
                    {bk.agent_Id?.name && (
                      <div className="text-sm text-gray-700">
                        Agent: {bk.agent_Id?.name}
                      </div>
                    )}
                    {bk.agentCut && (
                      <div className="text-sm text-gray-700">
                        agent_com: {bk.agentCut}
                      </div>
                    )}
                    {bk.advance_ss ? (
                      <div className="mt-2">
                        <img
                          src={imgurl + bk.advance_ss}
                          alt="Screenshot"
                          className="w-full max-h-48 object-contain border rounded cursor-pointer"
                          onClick={() => setShowImage(true)}
                        />

                        {showImage && (
                          <PopEffect cb={() => setShowImage(false)}>
                            <div className="w-full h-full flex justify-center items-center p-4">
                              <img
                                src={imgurl + bk.advance_ss}
                                alt="Full Screenshot"
                                className="max-h-[60vh] max-w-[80vw] object-contain rounded shadow-2xl"
                              />
                            </div>
                          </PopEffect>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-500 mt-2">
                        No screenshot uploaded
                      </div>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button
                        onClick={() => handleBookingDecision(bk._id, true)}
                        className="bg-green-900 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBookingDecision(bk._id, false)}
                        className="bg-red-900 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 py-4 text-center">
                No pending bookings
              </div>
            )}
          </div>
        </>
      )}
      {showNoRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4">🎉 Hello! Host</h2>
            <p className="mb-4">
              Before you can start using the calendar, you need to add your{" "}
              <strong>rooms and pricing</strong> details.
            </p>
            <button
              onClick={() => {
                setShowRoomsPricing(true);
                setShowNoRoomModal(false);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Room Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
