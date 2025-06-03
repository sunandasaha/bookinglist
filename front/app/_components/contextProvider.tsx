"use client";

import { JSX, useState } from "react";

type user = {
  token: string;
  role: string;
  email?: string;
} | null;

const contextProvider = ({
  children,
}: {
  children: JSX.Element | string | JSX.Element[];
}) => {
  const [user, setUser] = useState<user>(null);
  return <div>contextProvider</div>;
};

export default contextProvider;
