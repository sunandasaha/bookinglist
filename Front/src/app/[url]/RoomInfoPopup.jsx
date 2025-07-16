"use client";

import { useContext, useMemo } from "react";
import { Context } from "../_components/ContextProvider";
import { site } from "../_utils/request";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function RoomInfoPopup({ roomName }) {
  const { hosthotel } = useContext(Context);

  const roomData = useMemo(() => {
    if (!hosthotel) return null;

    if (hosthotel.pay_per?.person && hosthotel.per_person_cat) {
      for (const cat of hosthotel.per_person_cat) {
        if (cat.roomNumbers.includes(roomName)) {
          return {
            category: cat.name,
            images: cat.images,
            capacity: cat.capacity,
            advance: cat.advance,
            price: {
              one: cat.rate1,
              two: cat.rate2,
              three: cat.rate3,
              four: cat.rate4,
            },
            amenities: cat.amenities,
          };
        }
      }
    } else if (hosthotel.pay_per?.room && hosthotel.room_cat) {
      for (const cat of hosthotel.room_cat) {
        if (cat.room_no.includes(roomName)) {
          return {
            category: cat.name,
            images: cat.images,
            capacity: cat.capacity,
            advance: cat.advance,
            price: { rate: cat.price },
            amenities: cat.amenities,
            extraPerson: cat.price_for_extra_person,
          };
        }
      }
    }

    return null;
  }, [hosthotel, roomName]);

  if (!roomData) return <div className="p-4">Room details not found.</div>;

  return (
    <div className="p-3 w-full max-w-[95vw] mx-auto bg-white rounded-xl shadow-lg space-y-3">
      <div className="text-lg font-bold text-gray-800 truncate">Room :{roomName}</div>
      <div className="text-xs text-gray-500">
        Category: <span className="font-medium">{roomData.category}</span>
      </div>

      {/* Swiper Carousel with Navigation Arrows */}
      <div className="relative rounded-lg overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true
          }}
          className="w-full h-40"
        >
          {roomData.images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={site + "imgs/" + img}
                alt={`Room image ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Custom Navigation Arrows */}
        <div className="swiper-button-prev absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-800">
            <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="swiper-button-next absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-800">
            <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Room Details */}
      <div className="text-xs text-gray-700 space-y-1.5">
        <div className="flex justify-between">
          <span><strong>Capacity:</strong></span>
          <span>{roomData.capacity} persons</span>
        </div>

        {roomData.advance && (
          <div className="flex justify-between">
            <span><strong>Advance:</strong></span>
            <span>{roomData.advance.amount}
            {roomData.advance.percent ? "%" : " Rs"}</span>
          </div>
        )}
        {roomData.price.rate && (
          <div className="flex justify-between">
            <span><strong>Rate:</strong></span>
            <span>₹{roomData.price.rate}</span>
          </div>
        )}
        {(roomData.price.one >0  || roomData.price.two >0 || roomData.price.three >0 || roomData.price.four >0 ) && (
            <div>
              <div className="font-bold mb-1">Rates (Per Person):</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {roomData.price.one >0  && (
                  <>
                    <div>1 occupancy:</div>
                    <div className="text-right">₹{roomData.price.one}/person</div>
                  </>
                )}
                {roomData.price.two >0  && (
                  <>
                    <div>2 occupancy:</div>
                    <div className="text-right">₹{roomData.price.two}/person</div>
                  </>
                )}
                {roomData.price.three >0  && (
                  <>
                    <div>3 occupancy:</div>
                    <div className="text-right">₹{roomData.price.three}/person</div>
                  </>
                )}
                {roomData.price.four >0  && (
                  <>
                    <div>4 occupancy:</div>
                    <div className="text-right">₹{roomData.price.four}/person</div>
                  </>
                )}
              </div>
            </div>
          )}
           {roomData.extraPerson && (
          <div className="flex justify-between">
            <span><strong>Extra Person:</strong></span>
            <span>₹{roomData.extraPerson}</span>
          </div>
        )}

        {roomData.amenities?.length > 0 && (
          <div>
            <div className="font-bold mb-1">Amenities:</div>
            <div className="flex flex-wrap gap-1.5">
              {roomData.amenities.map((a, i) => (
                <span 
                  key={i} 
                  className="bg-gray-100 px-2 py-0.5 rounded-full text-xs"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}