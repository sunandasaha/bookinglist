"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const AuthNav = () => {
  const navigate = useRouter();

  return (
    <div className="auth-navbar">
      <Image src="/svgs/logo.png" alt="" width={30} height={30} />
      <div className="nav-elcon">
        <p
          onClick={() => {
            navigate.push("/t&c");
          }}
        >
          Terms & Conditions
        </p>
        <p
          onClick={() => {
            navigate.push("/about_us");
          }}
        >
          About Us
        </p>
        <p
          onClick={() => {
            navigate.push("/contact_us");
          }}
        >
          Contact Us
        </p>
      </div>
    </div>
  );
};

export default AuthNav;
