"use client";
import { useState, useContext } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay } from "date-fns";
import {CalendarDays,User,MoreVertical,ChevronLeft,ChevronRight,Search,Bell,CalendarCheck,CalendarX,Bed,Home,LogOut,} from "lucide-react";

import ProfileModal from "./ProfileModal";
import { useRouter } from "next/navigation";
import { Context } from "../../_components/ContextProvider.tsx";
import RoomsPricing from "./RoomsPricing";

export default function TopBar({ selectedDate, setSelectedDate, searchBID, setSearchBID }) {
  const { hosthotel, setUser, setHosthotel, pending } = useContext(Context);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRoomsPricing, setShowRoomsPricing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showNot , setShowNot] = useState(false);
  const navigate = useRouter();

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const toggleCalendar = () => setShowCalendar((prev) => !prev);
  const toggleSideMenu = () => setShowSideMenu((prev) => !prev);
  const toggleSearch = () => setSearchOpen((prev) => !prev);
  const handleBookingDecision = async (b, at) => {
    // accept code 

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
    setSearchOpen(false);
  };

  const openProfile = () => {
    setShowProfile(true);
    setShowSideMenu(false);
  };

  return (
    <div className="w-full px-6 py-4 flex items-center justify-between bg-white shadow-md z-50 relative">
      <div className="flex items-center gap-4">
        <MoreVertical
          onClick={toggleSideMenu}
          className="text-gray-700 hover:text-black cursor-pointer"
          size={24}
          title="Menu"
        />
        <img
          src="/svgs/logo.png"
          alt="BookingList"
          className="h-10 w-auto object-contain"
        />
      </div>

      {showSideMenu && (
        <div className="absolute left-0 top-16 w-64 bg-white shadow-xl rounded-r-lg border-t border-r border-b border-gray-200 z-50">
          <div className="p-4 space-y-2">
            <button
              onClick={openProfile}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-100 rounded-lg text-left text-black"
            >
              <User size={18} className="text-blue-600" />
              <span>Profile</span>
            </button>
            <button className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-black">
              <CalendarCheck size={18} className="text-green-600" />
              <span>Check In</span>
            </button>
            <button className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-black">
              <CalendarX size={18} className="text-red-600" />
              <span>Check Out</span>
            </button>
            <button
              onClick={handleToday}
              className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-black"
            >
              <Bed size={18} className="text-indigo-600" />
              <span>Today's booking</span>
            </button>

            <button
              onClick = {()=>{
                setShowRoomsPricing(true);
                setShowSideMenu(false);
              }}
             className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-black">
              <Home size={18} className="text-purple-600" />
              <span>Rooms & Pricing</span>
            </button>
            <button
              onClick={() => {
                setUser(null);
                setHosthotel(null);
                localStorage.removeItem("tok");
                navigate .push("/login");
              }}
              className="flex items-center gap-3 w-full p-2 hover:bg-blue-100 rounded-lg text-left text-red-600"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
      <div className="relative">
        <button
          onClick={toggleCalendar}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
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
            className="text-gray-700 hover:text-black cursor-pointer"
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
              onClick = {()=> setShowNot((prev)=> !prev)}
              className="text-gray-700 hover:text-black cursor-pointer"
              size={24}
              title="Notifications"
            />
          </div>
        </div>

       {showProfile && (
              <ProfileModal
                profile={hosthotel}
                onClose={() => setShowProfile(false)}
              />
            )}
            {showRoomsPricing && (
                <div className="absolute top-16 left-0 right-0 z-40 bg-white border-t shadow-md p-4">
                  <RoomsPricing pricingType={hosthotel?.pricingType} />
                  <button
                    onClick={() => setShowRoomsPricing(false)}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Close
                  </button>
                </div>
          )}
          {showNot && (
            <div className="absolute right-0 top-16 w-96 bg-white border-l shadow-lg z-50 max-h-[80vh] overflow-y-auto rounded-l-md p-4 space-y-4">
              <h2 className="text-lg font-bold mb-2">Pending Requests</h2>
              {pending?.length > 0 ? (
                pending.map((bk) => (
                  <div key={bk._id} className="border p-3 rounded shadow-sm bg-gray-50">
                    <div className="font-semibold">{bk.name}</div>
                    <div className="text-sm text-gray-700">📅 {format(new Date(bk.fromDate), "dd MMM")} → {format(new Date(bk.toDate), "dd MMM")}</div>
                    <div className="text-sm text-gray-700">💬 {bk.whatsapp}</div>
                    <div className="text-sm text-gray-700">Rooms: {bk.rooms.join(", ")}</div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleBookingDecision(bk._id, true)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBookingDecision(bk._id, false)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No pending bookings.</div>
              )}
            </div>
          )}


    </div>
  );
}
