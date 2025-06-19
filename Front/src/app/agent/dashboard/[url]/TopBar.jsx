"use client";

import { useState, useContext } from "react";
import {format,startOfMonth,endOfMonth,eachDayOfInterval,startOfDay,} from "date-fns";
import {CalendarDays,User,ChevronLeft,ChevronRight,} from "lucide-react";
import { Context } from "../../../_components/ContextProvider";
import ProfileModal from "./ProfileModal.jsx";

export default function TopBar({ selectedDate, setSelectedDate }) {
  const { hosthotel } = useContext(Context);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

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
  };

  return (
    <div className="w-full px-4 py-4 flex items-center justify-between bg-white shadow-md z-50 relative">
      <div className="flex items-center gap-3">
        <img
          src="/svgs/logo.png"
          alt="BookingList"
          className="h-10 w-auto object-contain"
        />
      </div>
      <div className="relative">
        <button
          onClick={() => setShowCalendar((prev) => !prev)}
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
              />
              <div className="text-lg font-semibold text-black">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <ChevronRight
                onClick={goToNextMonth}
                className="cursor-pointer text-gray-700 hover:text-black"
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
                >
                  {format(day, "d")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <button
          onClick={() => setShowProfile(true)}
          className="p-2 rounded-full hover:bg-gray-100"
          title="View Hotel Profile"
        >
          <User size={22} className="text-gray-700" />
        </button>
      </div>

      {showProfile && (
        <ProfileModal
          profile={hosthotel}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
