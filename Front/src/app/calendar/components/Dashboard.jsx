"use client";
import { useState, useContext, useEffect } from "react";
import TopBar from "./TopBar";
import CalendarGrid from "./CalendarGrid";
import { Context } from "../../_components/ContextProvider";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchBID, setSearchBID] = useState("");
  const { user, pending } = useContext(Context);
  const navigate = useRouter();

  useEffect(() => {
    console.log(pending);
    if (!user) {

      navigate.push("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      <TopBar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        searchBID={searchBID}
        setSearchBID={setSearchBID}
      />
      <CalendarGrid
        startDate={selectedDate}
        searchBID={searchBID}
      />
    </div>
  );
}