"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { Context, hostHotel } from "./_components/ContextProvider";
import { postReq } from "./_utils/request";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useRouter();
  const { setUser, user, setHosthotel, setAgent, setPending } =
    useContext(Context);

  const addstuff = (dat: hostHotel) => {
    if (!dat.pay_per) {
      dat.pay_per = { person: false, room: true };
    }
    return dat;
  };

  const logtok = async () => {
    const tok = localStorage.getItem("tok");
    if (tok) {
      localStorage.removeItem("tok");
      const res = await postReq("user/logtok", { tok }, "");
      if (res.status === "success") {
        if (setUser) setUser(res.user);
        localStorage.setItem("tok", res.user.token);
        if (res.user.role === "") {
          navigate.push("/role");
        } else if (res.user.role === "host") {
          if (res.user.cred) {
            if (setHosthotel) setHosthotel(addstuff(res.user.cred));
            if (res.user.pending && setPending) setPending(res.user.pending);
            navigate.push("/calendar");
          } else {
            navigate.push("/hotel");
          }
        } else if (res.user.role === "agent") {
          if (res.user.cred) {
            if (setAgent) setAgent(res.user.cred);
            navigate.push("/agent/dashboard");
          } else {
            navigate.push("/agent");
          }
        }
      }
    } else {
      navigate.push("/login");
    }
  };

  useEffect(() => {
    if (user?.role) {
    } else {
      logtok();
    }
  }, []);

  return (
    <div className="h-full w-full grid place-items-center">
      <motion.img
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        src="/svgs/logo.png"
        style={{ height: 100, width: 100 }}
      />
    </div>
  );
}
