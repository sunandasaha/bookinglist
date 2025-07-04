"use client";
import { useState } from "react";
import Superdashboard from "./Superdashboard";
import { postReq } from "../_utils/request";

export default function SuperAdminLogin() {
  const [uid, setUid] = useState("");
  const [pwd, setPwd] = useState("");
  const [admin, setAdmin] = useState(null);

  const handleLogin = async () => {
    if (uid.length > 3 && pwd.length > 3) {
      const res = await postReq(
        "user/login",
        { email: uid, password: pwd },
        ""
      );
      if (res.status === "success") {
        if (res.user.role === "sadmin") setAdmin(res.user);
        else alert("Unauthorised accsess");
      } else {
        alert(res.status);
      }
    } else {
      alert("Invalid credentials");
    }
  };

  if (admin) {
    return <Superdashboard admin={admin} setAdmin={setAdmin} />;
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Super Admin Login</h2>
        <input
          type="text"
          placeholder="UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}
