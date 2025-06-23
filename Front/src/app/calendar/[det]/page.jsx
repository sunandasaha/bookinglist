"use client";

import { useRouter } from "next/navigation";
import { Context } from "../../_components/ContextProvider";
import { getReq } from "../../_utils/request";
import React, { useContext, useEffect, useState } from "react";

const CheckDetails = ({ params }) => {
  const [bookings, setBookings] = useState();
  const [det, setDet] = useState();
  const navigate = useRouter();
  const { user } = useContext(Context);

  const getData = async () => {
    const par = (await params).det;
    const res = await getReq("guestbooking/chk/" + par, user?.token);
    console.log(res);
    if (res.success) {
      setBookings(res.bookings);
    } else {
      console.log(res);
    }
  };

  useEffect(() => {
    if (user) {
      getData();
    } else {
      navigate.push("/");
    }
  }, []);
  return <div>CheckDetails</div>;
};

export default CheckDetails;
