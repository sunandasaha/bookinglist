"use client";

import React, { useContext, useEffect, useState } from "react";
import AgentNav from "./_comp/AgentNav";
import { getReq } from "../../_utils/request";
import { Context } from "../../_components/ContextProvider";

type hots = {
  name: string;
  location: string;
  url: string;
};

const AgentDashboard = () => {
  const [hotels, setHotels] = useState<hots | null>(null);
  const { user } = useContext(Context);

  const getHotels = async () => {
    const res = await getReq("hotel/hotels", user.token);
    if (res.success) {
      setHotels(res.hotels);
    }
  };

  useEffect(() => {
    getHotels();
  }, []);

  return (
    <div>
      <AgentNav />
    </div>
  );
};

export default AgentDashboard;
