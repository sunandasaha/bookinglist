"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const Page = () => {
  const navigate = useRouter();

  useEffect(() => {
    localStorage.removeItem("tok");
  }, []);

  const handleClose = () => {
    if (window.confirm("Do you want to close this tab?")) {
      window.close();
      navigate.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 text-center bg-gray-100">
      <h1 className="text-xl font-semibold mb-4 text-red-700">
        Your account is still pending or deactivated temporarily.
      </h1>
      <p className="mb-6 text-gray-700">Please contact the admin for access.</p>

      <button
        onClick={handleClose}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
      >
        <ArrowLeft size={20} />
        Go Back
      </button>
    </div>
  );
};

export default Page;
