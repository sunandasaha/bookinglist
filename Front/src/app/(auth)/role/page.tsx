"use client";

import { useRouter } from "next/navigation";
import { useContext } from "react";
import { Context } from "../../_components/ContextProvider";
import { postReq } from "../../_utils/request";

const SelectRole = () => {
  const { user } = useContext(Context);
  const navigate = useRouter();

  const set_role = async (role: string) => {
    const res = await postReq("user/setrole", { role }, user.token);
    if (res.status === "success") {
      navigate.push("/hotel");
    }
  };

  return (
    <div className="con">
      SelectRole
      <button
        onClick={() => {
          set_role("host");
        }}
      >
        Host
      </button>
      <button>Agent</button>
    </div>
  );
};

export default SelectRole;
