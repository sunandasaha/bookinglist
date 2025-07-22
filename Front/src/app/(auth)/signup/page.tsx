"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Context } from "../../_components/ContextProvider";
import { postReq } from "../../_utils/request";
import Image from "next/image";

type info = {
  email: string;
  password: string;
  conpass: string;
};

const Signup = () => {
  const [show, setShow] = useState(false);
  const [disable, setDisable] = useState(false);
  const [prob, setProb] = useState("");
  const [agree, setAgree] = useState(false);
  const { setUser } = useContext(Context);
  const [info, setInfo] = useState<info>({
    email: "",
    password: "",
    conpass: "",
  });

  const navigate = useRouter();

  const signup = async () => {
    const reg =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    if (!agree) {
      setProb("You must agree to terms and policies.");
      return;
    }

    if (reg.test(info.email)) {
      if (info.password === info.conpass) {
        setDisable(true);
        const res = await postReq("user/signup", { ...info }, "");
        if (res.status === "success") {
          if (setUser) setUser(res.user);
          navigate.push("/role");
        } else {
          setProb(res.status);
          setDisable(false);
        }
      } else {
        setProb("Passwords do not match");
      }
    } else {
      setProb("Enter a valid email");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInfo((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white">
      <button
        onClick={() => navigate.back()}
        className="absolute top-4 left-4 text-gray-600 hover:text-blue-800 font-semibold"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Booking List</h1>

      <input
        id="email"
        type="email"
        value={info.email}
        onChange={handleChange}
        placeholder="Email address"
        className="w-full max-w-md p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="relative w-full max-w-md mb-4">
        <input
          id="password"
          type={show ? "text" : "password"}
          value={info.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Image
          height={20}
          width={20}
          src={show ? "/svgs/eye-s.svg" : "/svgs/eye.svg"}
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-3 top-3 cursor-pointer"
          alt="Toggle visibility"
        />
      </div>

      <input
        id="conpass"
        type="password"
        value={info.conpass}
        onChange={handleChange}
        placeholder="Confirm Password"
        className="w-full max-w-md p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <p className="text-sm text-red-600 mb-2">{prob}</p>

      <div className="flex items-start w-full max-w-md mb-4 text-sm">
        <input
          type="checkbox"
          className="mt-1 mr-2"
          checked={agree}
          onChange={() => setAgree(!agree)}
        />
        <p>
          By signing up, you agree to our{" "}
          <a href="/t&c" className="text-blue-600 hover:underline">Terms & Conditions</a> and{" "}
          <a href="/contact_us" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </p>
      </div>

      <button
        className="w-full max-w-md bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition"
        onClick={signup}
        disabled={disable}
      >
        Sign Up
      </button>

      <p className="mt-4 text-sm text-gray-700">
        Already have an account?{" "}
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate.push("/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Signup;
