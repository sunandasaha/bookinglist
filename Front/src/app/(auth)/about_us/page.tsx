"use client";

import { useRouter } from "next/navigation";
import React from "react";

const About = () => {
  const navigate = useRouter();

  const back = () => {
    navigate.push("/");
  };

  return (
    <div>
      About
      <button className="pbutton" onClick={back}>
        back
      </button>
    </div>
  );
};

export default About;
