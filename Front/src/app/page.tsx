"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { Context } from "./_components/ContextProvider";
import { postReq } from "./_utils/request";

export default function Home() {
  const navigate = useRouter();
  const { setUser, user, setHosthotel } = useContext(Context);

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
            if (setHosthotel) setHosthotel(res.user.cred);
            navigate.push("/calendar");
          } else {
            navigate.push("/hotel");
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
    <div className="con">
      <img src="/logo.png" style={{ height: 100, width: 100 }} />
    </div>
  );
}
