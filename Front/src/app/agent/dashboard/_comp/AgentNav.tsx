"use client";

import { useContext, useEffect } from "react";
import { Context } from "../../../_components/ContextProvider";
import { useRouter } from "next/navigation";

const AgentNav = () => {
  const { user, agent } = useContext(Context);
  const navigate = useRouter();

  useEffect(() => {
    if (!user || user?.role !== "agent") {
      navigate.push("/");
    } else {
      console.log(agent);
    }
  });
  return <div>AgentNav</div>;
};

export default AgentNav;
