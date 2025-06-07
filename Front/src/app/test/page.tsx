"use client";

import { useRef } from "react";
import { site } from "../_utils/request";

const Test = () => {
  const ref = useRef<HTMLInputElement>(null);
  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (ref.current) {
      const data = new FormData();
      for (let i = 0; i < ref.current.files.length; i++) {
        data.append("images", ref.current.files[i]);
      }
      const res = await fetch(site + "test", {
        method: "POST",
        body: data,
      });
      const dat = await res.json();
      console.log(dat);
    }
  };
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
