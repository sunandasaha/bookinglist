"use client";

import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import {ArrowLeft} from "lucide-react";
import { useContext, useEffect, useState } from "react";
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
    //email Validation
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
      setProb("Enter Valid email");
    }
  };

  const addstuff = (dat: hostHotel) => {
    if (!dat.pay_per) {
      dat.pay_per = { person: false, room: true };
    }
    return dat;
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
      console.log("error", error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "email")
      setInfo((p) => ({ ...p, email: e.target.value }));
    if (e.target.id === "password")
      setInfo((p) => ({ ...p, password: e.target.value }));
  };

  return (
    <div
      className="con"
      style={{ justifyContent: "space-evenly", height: 400 }}
    >
    <button
    onClick={() => navigate.back()}
    className="absolute top-4 left-4 text-black-600 hover:text-blue-800 font-semibold"
    >
     <ArrowLeft size={24} />
    </button>
    <h1 className="text-2xl font-medium">Booking List</h1>
      <input
        type="email"
        className="pinput"
        id="email"
        onChange={handleChange}
        value={info.email}
      />
      <div className="inp-div">
        <input
          style={{ border: "none", padding: "0 10px", borderRadius: 0 }}
          type={show ? "text" : "password"}
          id="password"
          className="pinput"
          onChange={handleChange}
          value={info.password}
        />
        <Image
          height={20}
          width={20}
          src={show ? "/svgs/eye-s.svg" : "/svgs/eye.svg"}
          onClick={() => {
            setShow((p) => !p);
          }}
          alt=""
        />
      </div>
      <p style={{ color: "red" }}>{prob}</p>
      <p className="pl">
        Don&apos;t have an account&lsquo;{" "}
        <span
          className="prm-p"
          onClick={() => {
            navigate.push("/signup");
          }}
        >
          Sign up
        </span>
      </p>
      <div className="inline">
        <button className="pbutton" onClick={googleLogin}>
          Google
        </button>
        <button className="pbutton" disabled={disable} onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
