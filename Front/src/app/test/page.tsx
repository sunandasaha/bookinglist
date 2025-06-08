"use client";

import { useContext, useEffect, useRef } from "react";
import { site } from "../_utils/request";
import { Context } from "../_components/ContextProvider";

const da = {
  name: "Yolo",
  room_no: ["102", "103"],
  capacity: 6,
  price: 1500,
  price_for_extra_person: 500,
  agent_com: { amount: 10, percent: true },
  advance: 300,
};

const Test = () => {
  const ref = useRef<HTMLInputElement>(null);
  const { user } = useContext(Context);
  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (ref.current) {
      const data = new FormData();
      data.append("details", JSON.stringify(da));
      for (let i = 0; i < ref.current.files.length; i++) {
        data.append("images", ref.current.files[i]);
      }
      const res = await fetch(site + "category/room", {
        method: "POST",
        headers: { authorization: user.token },
        body: data,
      });
      const dat = await res.json();
      console.log(dat);
    }
  };

  useEffect(() => {
    console.log(user);
  }, []);

  return (
    <div>
      Test
      <input ref={ref} type="file" multiple />
      <button className="pbutton" onClick={handleClick}>
        Click
      </button>
    </div>
  );
};

export default Test;
