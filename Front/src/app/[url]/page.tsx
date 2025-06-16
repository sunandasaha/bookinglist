"use client";

import { useContext, useEffect, useState } from "react";
import { Context, hostHotel } from "../_components/ContextProvider";
import { site } from "../_utils/request";
import { motion } from "framer-motion";

const Guest = ({ params }) => {
  const [load, setLoad] = useState(false);
  const { setHosthotel, hosthotel } = useContext(Context);

  const getHotel = async () => {
    const hotelurl = (await params).url;
    const data = await fetch(site + "hotel/", { headers: { hotelurl } });
    const res = await data.json();
    console.log(res);

    if (res.success) {
      setHosthotel(res.hotel);
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
          {hosthotel ? (
            <div>{hosthotel.name}</div>
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
