"use client";

import React, { useContext, useEffect, useState } from "react";
import AgentNav from "./_comp/AgentNav";
import { getReq } from "../../_utils/request";
import { Context } from "../../_components/ContextProvider";

type Hotel = {
  name: string;
  location: string;
  url: string;
};

const AgentDashboard = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const { user } = useContext(Context);

  const getHotels = async () => {
    const res = await getReq("hotel/hotels", user.token);
    if (res.success) {
      setHotels(res.hotels);
    }
  };

  useEffect(() => {
    if (user?.role === "agent") {
      getHotels();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentNav hotels={hotels} />
    </div>
  );
};

export default AgentDashboard;
