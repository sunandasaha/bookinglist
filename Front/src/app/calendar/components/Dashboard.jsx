"use client";
import { useState, useContext, useEffect, useMemo } from "react";
import TopBar from "./TopBar";
import CalendarGrid from "./CalendarGrid";
import { Context } from "../../_components/ContextProvider";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { site } from "../../_utils/request";

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchBID, setSearchBID] = useState("");
  const { user, hosthotel, socket, setSocket } = useContext(Context);
  const navigate = useRouter();

  useEffect(() => {
    if (!user) {
      navigate.push("/");
    }
    if (hosthotel && !socket) {
      const soc = io(site);
      soc.emit("host-con", { hotelid: hosthotel?._id });
      setSocket(soc);
    }
  }, []);

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      <TopBar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        searchBID={searchBID}
        setSearchBID={setSearchBID}
      />
      <CalendarGrid startDate={selectedDate} searchBID={searchBID} />
    </div>
  );
}
