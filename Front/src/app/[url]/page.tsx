"use client";

import { useEffect, useState } from "react";
import { hostHotel } from "../_components/ContextProvider";
import { site } from "../_utils/request";
import { motion } from "framer-motion";
import Dashboard from "./Dashboard";

const Guest = ({ params }) => {
  const [hotel, setHotel] = useState<hostHotel | null>(null);
  const [load, setLoad] = useState(false);

  const getHotel = async () => {
    const hotelurl = (await params).url;
    const data = await fetch(site + "hotel/", { headers: { hotelurl } });
    const res = await data.json();
    console.log(res);

    if (res.success) {
      setHotel(res.hotel);
    }
    setLoad(true);
  };

  useEffect(() => {
    getHotel();
  }, []);
  return (

    <div>
      {load ? (
        <div>
          {hotel ? (
            <div>
              <Dashboard  hotel={hotel} />
            </div>
          ) : (
            <div>
              <p>Hotel Not Found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full w-full grid place-items-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            src="/svgs/logo.png"
            style={{ height: 100, width: 100 }}
          />
        </div>
      )}
    </div>
  );
};

export default Guest;
