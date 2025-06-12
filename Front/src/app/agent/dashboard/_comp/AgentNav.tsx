"use client";

import { useContext, useEffect, useState } from "react";
import { Context } from "../../../_components/ContextProvider";
import { useRouter } from "next/navigation";
import { MenuIcon } from "lucide-react";
import AgentSideBar from "./AgentSideBar";
import PopEffect from "../../../_components/PopEffect";
import AgentProfile from "./AgentProfile";

const AgentNav = () => {
  const { user, agent } = useContext(Context);
  const navigate = useRouter();
  const [sb, setSb] = useState(false);
  const [pr, setPr] = useState(false);

  const cb = () => {
    setSb(false);
  };
  const npr = () => {
    setPr(false);
  };
  const ypr = () => {
    setPr(true);
  };

  useEffect(() => {
    if (!user || user?.role !== "agent") {
      navigate.push("/");
    } else {
      console.log(agent);
    }
  });
  return (
    <div>
      <div>
        <MenuIcon
          onClick={() => {
            setSb((p) => !p);
          }}
        />
      </div>
      {sb && <AgentSideBar cb={cb} ypr={ypr} />}
      {pr && (
        <PopEffect cb={npr}>
          <div className="flex flex-col items-center gap-10">
            <AgentProfile />
            <div className="inline">
              <button
                className="pbutton"
                onClick={() => {
                  navigate.push("/agent");
                }}
              >
                Edit
              </button>
              <button className="pbutton" onClick={npr}>
                Cancel
              </button>
            </div>
          </div>
        </PopEffect>
      )}
    </div>
  );
};

export default AgentNav;
