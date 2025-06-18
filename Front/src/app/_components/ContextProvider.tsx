"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { createContext, JSX, useState } from "react";
import { Socket } from "socket.io-client";

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

type booking = {
  hotelId: string;
  agent_Id?: string;
  ub_ids: string[];
  status: number;
  amountPaid?: number;
  _id: string;
  name: string;
  email?: String;
  phone?: Number;
  whatsapp: number;
  address: string;
  fromDate: string;
  toDate: string;
  rooms: string[];
  adults: number;
  children?: number;
  age_0_5?: number;
  age_6_10?: number;
  totalPrice: number;
  advanceAmount: number;
  createdAt?: string;
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

export type agent = {
  _id?: string;
  name: string;
  location: string;
  agency: string;
  ph1: string;
  ph2?: string;
  hotel_per: string[];
  visiting_card?: string;
  upi_id?: string;
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
  agent: agent | null;
  setUser: React.Dispatch<React.SetStateAction<user>> | null;
  setPop: React.Dispatch<React.SetStateAction<string>> | null;
  setHosthotel: React.Dispatch<React.SetStateAction<hostHotel | null>> | null;
  setAgent: React.Dispatch<React.SetStateAction<agent | null>> | null;
  pop: string;
  pending: booking[] | null;
  socket: Socket | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>> | null;
  setPending: React.Dispatch<React.SetStateAction<booking[] | null>> | null;
};

export const Context = createContext<Ccontext>({
  user: null,
  hosthotel: null,
  setUser: null,
  setHosthotel: null,
  pop: "",
  setPop: null,
  agent: null,
  setAgent: null,
  pending: null,
  setPending: null,
  socket: null,
  setSocket: null,
});

const ContextProvider = ({
  children,
}: {
  children: JSX.Element | React.ReactNode;
}) => {
  const [user, setUser] = useState<user>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [agent, setAgent] = useState<agent | null>(null);
  const [hosthotel, setHosthotel] = useState<hostHotel | null>(null);
  const [pop, setPop] = useState("");
  const [pending, setPending] = useState<booking[] | null>(null);

  return (
    <Context.Provider
      value={{
        user,
        hosthotel,
        setUser,
        pop,
        setPop,
        setHosthotel,
        agent,
        setAgent,
        pending,
        setPending,
        setSocket,
        socket,
      }}
    >
      <GoogleOAuthProvider clientId="85449916853-ilvmr3fr74rmit72esdsbvoptgvbr1m3.apps.googleusercontent.com">
        {children}
      </GoogleOAuthProvider>
    </Context.Provider>
  );
};

export default ContextProvider;
