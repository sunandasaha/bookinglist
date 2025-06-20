"use client";

import { useRouter } from "next/navigation";
import { Context } from "../../_components/ContextProvider";
import { getReq } from "../../_utils/request";
import { useContext, useEffect, useState } from "react";

const AgentHistory = () => {
  const [his, setHis] = useState();
  const { user } = useContext(Context);
  const navigate = useRouter();

  const getData = async () => {
    const res = await getReq("guestbooking/agent", user?.token || "");
    console.log(res);

    if (res.success) {
      setHis(res);
    }
  };

  useEffect(() => {
    if (user) {
      getData();
    } else {
      navigate.push("/");
    }
  }, []);

  return <div>AgentHistory</div>;
};

export default AgentHistory;
