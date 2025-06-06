"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { Context } from "../../_components/ContextProvider";
import { postReq } from "../../_utils/request";

type info = {
  email: string;
  password: string;
  conpass: string;
};

const Signup = () => {
  const [show, setShow] = useState(false);
  const [disable, setDisable] = useState(false);
  const [prob, setProb] = useState("");
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
    //email Validation
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
        setProb("Password not matching");
      }
    } else {
      setProb("Enter Valid email");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === "email")
      setInfo((p) => ({ ...p, email: e.target.value }));
    if (e.target.id === "password")
      setInfo((p) => ({ ...p, password: e.target.value }));
    if (e.target.id === "conpass")
      setInfo((p) => ({ ...p, conpass: e.target.value }));
  };

  return (
    <div
      className="con"
      style={{ justifyContent: "space-evenly", height: 400 }}
    >
      <h1>Booking List</h1>
      <input
        type="email"
        className="pinput"
        id="email"
        onChange={handleChange}
        value={info.email}
        placeholder="Email"
      />
      <div className="inp-div">
        <input
          style={{ border: "none", padding: "0 10px", borderRadius: 0 }}
          type={show ? "text" : "password"}
          id="password"
          placeholder="Password"
          className="pinput"
          onChange={handleChange}
        />
        <img
          style={{ height: 20, width: 20 }}
          src={show ? "/svgs/eye-s.svg" : "/svgs/eye.svg"}
          onClick={() => {
            setShow((p) => !p);
          }}
        />
      </div>
      <input
        type="password"
        className="pinput"
        id="conpass"
        onChange={handleChange}
        value={info.conpass}
        placeholder="Confirm Password"
      />
      <p style={{ color: "red" }}>{prob}</p>
      <p className="pl">
        Already have an account?{" "}
        <span
          className="prm-p"
          onClick={() => {
            navigate.push("/login");
          }}
        >
          login.
        </span>
      </p>
      <div>
        <button className="pbutton" disabled={disable} onClick={signup}>
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Signup;
