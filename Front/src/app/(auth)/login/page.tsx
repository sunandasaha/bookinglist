"use client";

import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useContext, useState } from "react";
import { Context, hostHotel } from "../../_components/ContextProvider";
import { postReq } from "../../_utils/request";
import Image from "next/image";

type info = {
  email: string;
  password: string;
};

const Login = () => {
  const [show, setShow] = useState(false);
  const [disable, setDisable] = useState(false);
  const [prob, setProb] = useState("");
  const [info, setInfo] = useState<info>({ email: "", password: "" });
  const navigate = useRouter();
  const { setUser, setHosthotel, setAgent, setPending } = useContext(Context);

  const login = async () => {
    const reg =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    if (reg.test(info.email)) {
      setDisable(true);
      const res = await postReq("user/login", { ...info }, "");
      if (res.status === "success") {
        if (setUser) setUser(res.user);
        localStorage.setItem("tok", res.user.token);
        if (res.user.role === "") {
          navigate.push("/role");
        } else if (res.user.role === "host") {
          if (res.user.cred) {
            if (res.user.status === 1) {
              if (setHosthotel) setHosthotel(res.user.cred);
              if (res.user.pending && setPending) setPending(res.user.pending);
              navigate.push("/calendar");
            } else {
              navigate.push("/status");
            }
          } else {
            navigate.push("/hotel");
          }
        } else if (res.user.role === "agent") {
          if (res.user.cred) {
            if (res.user.status === 1) {
              if (setAgent) setAgent(res.user.cred);
              navigate.push("/agent/dashboard");
            } else {
              navigate.push("/status");
            }
          } else {
            navigate.push("/agent");
          }
        }
      } else {
        setDisable(false);
        setProb(res.status);
      }
    } else {
      setProb("Enter a valid email");
    }
  };

  const responseGoogle = async (authRes: any) => {
    try {
      if (authRes.code) {
        const res = await postReq("user/glogin", { code: authRes.code }, "");
        googleLogout();
        if (res.status === "success") {
          if (setUser) setUser(res.user);
          localStorage.setItem("tok", res.user.token);
          if (res.user.role === "") {
            navigate.push("/role");
          } else if (res.user.role === "host") {
            if (res.user.cred) {
              if (res.user.status === 1) {
                if (setHosthotel) setHosthotel(res.user.cred);
                if (res.user.pending && setPending)
                  setPending(res.user.pending);
                navigate.push("/calendar");
              } else {
                navigate.push("/status");
              }
            } else {
              navigate.push("/hotel");
            }
          } else if (res.user.role === "agent") {
            if (res.user.cred) {
              if (res.user.status === 1) {
                if (setAgent) setAgent(res.user.cred);
                navigate.push("/agent/dashboard");
              } else {
                navigate.push("/status");
              }
            } else {
              navigate.push("/agent");
            }
          }
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInfo((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 bg-white">
      <button
        onClick={() => navigate.back()}
        className="absolute top-4 left-4 text-gray-600 hover:text-blue-800"
      >
        <ArrowLeft size={24} />
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Booking List</h1>

      <button
        className="w-full max-w-md bg-white border border-gray-300 py-3 rounded-full flex items-center justify-center gap-2 hover:shadow-md transition mb-4"
        onClick={googleLogin}
      >
        <Image src="/svgs/google.svg" alt="Google" width={20} height={20} />
        <span className="text-sm text-gray-800 font-medium">
          Sign in with Google
        </span>
      </button>

      <div className="relative w-full max-w-md mb-4">
        <hr className="border-gray-300" />
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-sm text-gray-500">
          or login with email
        </span>
      </div>

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
          onClick={() => setShow(!show)}
          className="absolute right-3 top-3 cursor-pointer"
          alt="Toggle visibility"
        />
      </div>

      <p className="text-sm text-red-600 mb-2">{prob}</p>

      <button
        className="w-full max-w-100px bg-blue-900 text-white py-3 rounded-full hover:bg-blue-600 transition"
        onClick={login}
        disabled={disable}
      >
        Login
      </button>

      <p className="mt-4 text-sm text-gray-700">
        Don’t have an account?{" "}
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate.push("/signup")}
        >
          Sign up
        </span>
      </p>
    </div>
  );
};

export default Login;
