"use client";

import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import PopEffect from "../_components/PopEffect";

const AuthNav = () => {
  const [pop, setPop] = useState({ tc: false, ab: false });

  const clrPop = () => {
    setPop({ tc: false, ab: false });
  };

  return (
    <div className="auth-navbar">
      <img src="/logo.png" alt="" />
      <div className="nav-elcon">
        <p
          onClick={() => {
            setPop({ tc: true, ab: false });
          }}
        >
          Terms & Conditions
        </p>
        <p>About Us</p>
      </div>
      <AnimatePresence>
        {pop.tc && (
          <PopEffect cb={clrPop}>
            <div></div>
          </PopEffect>
        )}
        {pop.ab && (
          <PopEffect cb={clrPop}>
            <div></div>
          </PopEffect>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthNav;
