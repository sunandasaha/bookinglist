"use client";

import { useState, useEffect } from "react";
import { Bell, Search } from "lucide-react";
import PopEffect from "../_components/PopEffect";
import { delReq, getReq, imgurl, putReq } from "../_utils/request";
import { AnimatePresence } from "framer-motion";

export default function SuperAdminDashboard({ admin, setAdmin }) {
  const [search, setSearch] = useState("");
  const [showNot, setShowNot] = useState(false);
  const [viewType, setViewType] = useState("host");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedApprovedUser, setSelectedApprovedUser] = useState(null);

  const getData = async () => {
    const res1 = await getReq("sadmin/pending", admin?.token);
    if (res1.success) setPendingUsers(res1.users);

    const res2 = await getReq("sadmin/users", admin?.token);
    if (res2.success) setAllUsers(res2.users);
  };

  useEffect(() => {
    getData();
  }, []);

  const parseSID = (sidString) => {
    return JSON.parse(sidString);
  };

  const handleNot = async (status, uid) => {
    const res = await putReq("sadmin/status", { status, uid }, admin.token);
    if (res.success) {
      getData();
    }
  };

  const handleDelete = async (id) => {
    const res = await delReq("sadmin/user", { id }, admin.token);
    if (res.success) {
      setSelectedApprovedUser(null);
      getData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/svgs/logo.png"
            onClick={() => {
              setAdmin(null);
            }}
            className="h-8 w-auto"
            alt="logo"
          />
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
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {allUsers.length > 0 ? (
          allUsers
            .filter((u) => u.role === viewType)
            .filter((u) => {
              const parsed = parseSID(u.sid);
              const name = parsed?.name?.toLowerCase() || "";
              const agency = parsed?.agency?.toLowerCase() || "";
              const location = parsed?.location?.toLowerCase() || "";

              return (
                name.includes(search.toLowerCase()) ||
                agency.includes(search.toLowerCase()) ||
                location.includes(search.toLowerCase())
              );
            })
            .map((u) => {
              const parsed = parseSID(u.sid);
              return (
                <div
                  key={u._id}
                  onClick={() => setSelectedApprovedUser({ ...u, parsed })}
                  className="bg-white border rounded p-3 shadow-sm cursor-pointer hover:bg-gray-100"
                >
                  <p className="font-semibold text-sm sm:text-base">
                    {parsed?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {u.role === "host" ? parsed?.location : parsed?.agency}
                  </p>
                </div>
              );
            })
        ) : (
          <p className="text-sm text-gray-500">No approved users found.</p>
        )}
      </div>
      <AnimatePresence>
        {selectedApprovedUser && (
          <PopEffect cb={() => setSelectedApprovedUser(null)}>
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-md p-6 space-y-4 text-black">
              <h2 className="text-xl font-bold mb-4 text-center text-green-600 border-b pb-2">
                {selectedApprovedUser.role === "host"
                  ? "🏨 Host Profile"
                  : "🧑‍💼 Agent Profile"}
              </h2>

              <div className="space-y-3 text-sm text-black">
                <ProfileRow
                  label={
                    selectedApprovedUser.role === "host"
                      ? "🏨 Hotel"
                      : "👤 Name"
                  }
                  value={selectedApprovedUser.parsed?.name}
                />
                {selectedApprovedUser.role === "agent" && (
                  <ProfileRow
                    label="🏢 Agency"
                    value={selectedApprovedUser.parsed?.agency}
                  />
                )}
                <ProfileRow
                  label="📍 Location"
                  value={selectedApprovedUser.parsed?.location}
                />
                <ProfileRow
                  label="📧 Email"
                  value={selectedApprovedUser.email}
                />
                <ProfileRow
                  label="💬 Whatsapp"
                  value={selectedApprovedUser.parsed?.ph1}
                />
                {selectedApprovedUser.role === "agent" && (
                  <>
                    {selectedApprovedUser.parsed?.visiting_card && (
                      <div className="flex justify-between items-start gap-4 border-b pb-2">
                        <span className="font-medium text-gray-700 whitespace-nowrap">
                          🖼️ Visiting Card:
                        </span>
                        <img
                          src={
                            imgurl +
                            (selectedApprovedUser.parsed.visiting_card || "")
                          }
                          alt="Visiting Card"
                          className="w-40 h-auto rounded border"
                        />
                      </div>
                    )}
                  </>
                )}
                {selectedApprovedUser.role === "host" && (
                  <>
                    <ProfileRow
                      label="💰 UPI ID"
                      value={selectedApprovedUser.parsed?.upi_id}
                    />
                    <ProfileRow
                      label="🌐 URL"
                      value={
                        selectedApprovedUser.parsed?.url && (
                          <a
                            href={selectedApprovedUser.parsed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-words"
                          >
                            {selectedApprovedUser.parsed.url}
                          </a>
                        )
                      }
                    />
                    <ProfileRow
                      label="🛏️ Rooms"
                      value={selectedApprovedUser.parsed?.rooms}
                    />
                    <ProfileRow
                      label="Guest Clicks"
                      value={selectedApprovedUser.parsed?.guestClicks || 0}
                    />
                    <ProfileRow
                      label="Agent Clicks"
                      value={selectedApprovedUser.parsed?.agentClicks || 0}
                    />
                  </>
                )}
              </div>
              <div className="flex justify-center gap-4 pt-4">
                {selectedApprovedUser.status === 0 ? (
                  <>
                    <button
                      className="flex-1 bg-green-600 text-white py-2 rounded"
                      onClick={() => {
                        handleNot(1, selectedApprovedUser._id);
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedApprovedUser._id);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 rounded"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={async () => {
                        const newS = selectedApprovedUser.status === 3 ? 1 : 3;
                        await handleNot(newS, selectedApprovedUser._id);
                        setSelectedApprovedUser(null);
                      }}
                      className={`px-4 py-2 text-white rounded hover:bg-opacity-80 ${
                        selectedApprovedUser.status === 3
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {selectedApprovedUser.status === 3
                        ? "Activate"
                        : "Deactivate"}
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(selectedApprovedUser._id);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </PopEffect>
        )}
      </AnimatePresence>
      {showNot && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="w-full sm:w-[90%] md:w-[400px] bg-white p-4 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold">Pending Approvals</h2>
              <button onClick={() => setShowNot(false)}>✕</button>
            </div>
            {pendingUsers.length > 0 ? (
              pendingUsers.map((u) => (
                <div
                  key={u._id}
                  onClick={() => {
                    const parsed = parseSID(u.sid);
                    setSelectedApprovedUser({ ...u, parsed });
                    setShowNot(false);
                  }}
                  className="bg-gray-50 border rounded p-3 mb-3 shadow-sm cursor-pointer hover:bg-gray-100"
                >
                  <p className="font-semibold">{u.email}</p>
                  <p className="text-sm text-gray-600">Role: {u.role}</p>
                  <p className="text-sm text-gray-600">
                    Tap to see the details
                  </p>

                  <div className="flex gap-3 mt-4">
                    <button
                      className="flex-1 bg-green-600 text-white py-2 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNot(1, u._id);
                        setShowNot(false);
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(u._id);
                        setShowNot(false);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
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
    </div>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 border-b pb-2">
      <span className="font-medium text-gray-700 whitespace-nowrap">
        {label}:
      </span>
      <span className="text-blue-600 font-semibold text-right break-words max-w-[60%]">
        {value || "N/A"}
      </span>
    </div>
  );
}
