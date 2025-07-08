"use client";

import { useRouter } from "next/navigation";
import React from "react";
import "./land.css";

const Landing = () => {
  const navigate = useRouter();
  return (
    <div className="land-con">
      <div className="img-con">
        <img className="land-img" src="/svgs/land1.svg" alt="" />
      </div>
      <div className="land-btn-con">
        <h1>Welcome to Booking List</h1>
        <div className="land-btns">
          <button
            className="pbutton"
            onClick={() => {
              navigate.push("/login");
            }}
          >
            Login
          </button>
          <button
            className="pbutton scnd-btn"
            onClick={() => {
              navigate.push("/signup");
            }}
          >
            Register
          </button>
        </div>
        <div>
          <p
            onClick={() => {
              navigate.push("/t&c");
            }}
          >
            Terms & Condition
          </p>
          <p
            onClick={() => {
              navigate.push("/about_us");
            }}
          >
            About us
          </p>
          <p
            onClick={() => {
              navigate.push("/contact_us");
            }}
          >
            Contact us
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
