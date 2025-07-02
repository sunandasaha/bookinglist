"use client";

import { useRouter } from "next/navigation";
import React from "react";

const Tnc = () => {
  const navigate = useRouter();

  const back = () => {
    navigate.push("/");
  };
  return (
    <div>
      Tnc
      <button className="pbutton" onClick={back}>
        back
      </button>
    </div>
  );
};

export default Tnc;
