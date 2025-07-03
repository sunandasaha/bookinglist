"use client";

import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import PopEffect from "../_components/PopEffect";
import { getReq } from "../_utils/request";

export default function SuperAdminDashboard({ admin }) {
  const [search, setSearch] = useState("");
  const [showNot, setShowNot] = useState(false);
  const [viewType, setViewType] = useState("host");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const getData = async () => {
    const res1 = await getReq("sadmin/pending", admin?.token);
    if (res1.success) setPendingUsers(res1.users);
    const res2 = await getReq("sadmin/users", admin?.token);
    if (res2.success) setAllUsers(res2.users);
  };

  useEffect(() => {
    getData();
  }, []);

  const handleDecision = async (id, res) => {
    //  Send accept/reject to backend

    console.log("Decision for", id, res);
    setPendingUsers((prev) => prev.filter((u) => u._id !== id));
    setSelectedUser(null);
  };

  const filtered = pendingUsers.filter(
    (u) =>
      u.type === viewType &&
      (u.name || u.hotelName || u.agencyName || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/svgs/logo.png" className="h-8 w-auto" alt="logo" />
        </div>
        <div className="flex items-center flex-1 max-w-md mx-4 relative">
          <Search className="absolute left-3 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search host or agent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm text-black bg-white"
          >
            <option value="host">Host</option>
            <option value="agent">Agent</option>
          </select>

          <div className="relative">
            <Bell
              onClick={() => setShowNot((prev) => !prev)}
              className="text-gray-700 hover:text-black cursor-pointer"
              size={24}
            />
            {pendingUsers.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingUsers.length}
              </span>
            )}
          </div>
        </div>
      </div>
      {showNot && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="w-full sm:w-[90%] md:w-[400px] bg-white p-4 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
              <button onClick={() => setShowNot(false)}>✕</button>
            </div>

            {filtered.length > 0 ? (
              filtered.map((u) => (
                <div
                  key={u._id}
                  onClick={() => setSelectedUser(u)}
                  className="bg-gray-50 border rounded p-3 mb-3 shadow-sm cursor-pointer hover:bg-gray-100"
                >
                  {u.type === "host" ? (
                    <>
                      <p className="font-semibold">{u.hotelName}</p>
                      <p className="text-sm text-gray-600">📍 {u.location}</p>
                      <p className="text-sm text-gray-600">📞 {u.phone}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-gray-600">🏢 {u.agencyName}</p>
                      <p className="text-sm text-gray-600">📍 {u.location}</p>
                      <p className="text-sm text-gray-600">📞 {u.phone}</p>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500 mt-10">
                No pending requests.
              </p>
            )}
          </div>
        </div>
      )}
      {selectedUser && (
        <PopEffect cb={() => setSelectedUser(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[90vw] sm:w-[400px] p-5 space-y-3">
            <h3 className="text-lg font-bold">Details</h3>

            {selectedUser.type === "host" ? (
              <>
                <p>
                  <strong>Hotel:</strong> {selectedUser.hotelName}
                </p>
                <p>
                  <strong>Location:</strong> {selectedUser.location}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedUser.phone}
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Name:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Agency:</strong> {selectedUser.agencyName}
                </p>
                <p>
                  <strong>Location:</strong> {selectedUser.location}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedUser.phone}
                </p>
              </>
            )}

            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-green-600 text-white py-2 rounded"
                onClick={() => handleDecision(selectedUser._id, true)}
              >
                Approve
              </button>
              <button
                className="flex-1 bg-red-600 text-white py-2 rounded"
                onClick={() => handleDecision(selectedUser._id, false)}
              >
                Reject
              </button>
            </div>
          </div>
        </PopEffect>
      )}
    </div>
  );
}
