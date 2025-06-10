"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { createContext, JSX, useState } from "react";

type user = {
  token: string;
  role: string;
  email?: string;
} | null;

export type hostHotel = {
  _id?: string;
  name: string;
  location: string;
  upi_id: string;
  url?: string;
  ph1: string;
  pay_per: { person: boolean; room: boolean };
  ph2?: string;
  rooms: number;
  room_cat?: room_cat[];
  per_person_cat?: per_percent_cat[];
};

type room_cat = {
  _id?: string;
  name: string;
  price: number;
  advance: { amount: number; percent: boolean };
  images: string[];
  room_no: string[];
  capacity: number;
  price_for_extra_person: number;
  agent_com: { amount: number; percent: boolean };
  amenities: string[];
};

type per_percent_cat = {
  _id?: string;
  name: string;
  roomNumbers: string[];
  amenities: string[];
  capacity: number;
  rate1: number;
  rate2: number;
  rate3: number;
  rate4: number;
  agentCommission?: { amount: number; percent: boolean };
  advance?: { amount: number; percent: boolean };
  images: string[];
};

type Ccontext = {
  user: user;
  hosthotel: hostHotel | null;
  setUser: React.Dispatch<React.SetStateAction<user>> | null;
  setPop: React.Dispatch<React.SetStateAction<string>> | null;
  setHosthotel: React.Dispatch<React.SetStateAction<hostHotel | null>> | null;
  pop: string;
};

export const Context = createContext<Ccontext>({
  user: null,
  hosthotel: null,
  setUser: null,
  setHosthotel: null,
  pop: "",
  setPop: null,
});

const ContextProvider = ({
  children,
}: {
  children: JSX.Element | React.ReactNode;
}) => {
  const [user, setUser] = useState<user>(null);
  const [hosthotel, setHosthotel] = useState<hostHotel | null>(null);
  const [pop, setPop] = useState("");

  return (
    <Context.Provider
      value={{ user, hosthotel, setUser, pop, setPop, setHosthotel }}
    >
      <GoogleOAuthProvider clientId="85449916853-ilvmr3fr74rmit72esdsbvoptgvbr1m3.apps.googleusercontent.com">
        {children}
      </GoogleOAuthProvider>
    </Context.Provider>
  );
};

export default ContextProvider;
