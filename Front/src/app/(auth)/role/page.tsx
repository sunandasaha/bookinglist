"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { Context } from "../../_components/ContextProvider";
import { postReq } from "../../_utils/request";

const SelectRole = () => {
  const { user, setUser } = useContext(Context);
  const navigate = useRouter();

  const set_role = async (role: string) => {
    if (user.role === "") {
      const res = await postReq("user/setrole", { role }, user.token);
      if (res.status === "success") {
        setUser((p) => ({ ...p, role: res.user.role }));
        if (res.user.role === "host") navigate.push("/hotel");
        else if (res.user.role === "agent") navigate.push("/agent");
      }
    }
  };

  return (
    <div className="con">
      <h1 className="heading">Select Role</h1>
      <div className="grid grid-cols-2 gap-4">
        <button
          className="pbutton"
          onClick={() => {
            set_role("host");
          }}
        >
          Host
        </button>
        <button
          className="pbutton"
          onClick={() => {
            set_role("agent");
          }}
        >
          Agent
        </button>
      </div>
    </div>
  );
};

export default SelectRole;
