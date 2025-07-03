"use client";

import { useRouter } from "next/navigation";
import React from "react";

const Contact = () => {
  const navigate = useRouter();

  const back = () => {
    navigate.push("/");
  };
  return (
    <div>
      Contact
      <button className="pbutton" onClick={back}>
        back
      </button>
    </div>
  );
};

export default Contact;
