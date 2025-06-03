"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { createContext, JSX, useState } from "react";

type user = {
  token: string;
  role: string;
  email?: string;
} | null;

type Ccontext = {
  user: user;
  setUser: React.Dispatch<React.SetStateAction<user>> | null;
  setPop: React.Dispatch<React.SetStateAction<string>> | null;
  pop: string;
};

export const Context = createContext<Ccontext>({
  user: null,
  setUser: null,
  pop: "",
  setPop: null,
});

const ContextProvider = ({
  children,
}: {
  children: JSX.Element | React.ReactNode;
}) => {
  const [user, setUser] = useState<user>(null);
  const [pop, setPop] = useState("");

  return (
    <Context.Provider value={{ user, setUser, pop, setPop }}>
      <GoogleOAuthProvider clientId="85449916853-ilvmr3fr74rmit72esdsbvoptgvbr1m3.apps.googleusercontent.com">
        {children}
      </GoogleOAuthProvider>
    </Context.Provider>
  );
};

export default ContextProvider;
