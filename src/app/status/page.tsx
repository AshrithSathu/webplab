"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserStatus {
  id: number;
  name: string;
  startupName: string;
  status: {
    status: "In Office" | "Out of Office";
    updatedAt: string;
  };
}

export default function StatusDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [currentStatus, setCurrentStatus] = useState<
    "In Office" | "Out of Office"
  >("Out of Office");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchStatuses();
  }, [router]);

  const fetchStatuses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);

      // Set current user's status
      const currentUser = data.users.find(
        (user: UserStatus) =>
          user.id === JSON.parse(atob(token!.split(".")[1])).id
      );
      if (currentUser) {
        setCurrentStatus(currentUser.status.status);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const newStatus =
        currentStatus === "In Office" ? "Out of Office" : "In Office";

      const res = await fetch("/api/status/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentStatus(newStatus);
      setMessage(`Status updated to ${newStatus}`);
      fetchStatuses(); // Refresh all statuses
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transform transition-all duration-200 hover:shadow-xl">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
            Your Status
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  currentStatus === "In Office"
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500"
                }`}
              />
              <span className="text-lg text-gray-700 font-medium">
                {currentStatus}
              </span>
            </div>
            <button
              onClick={toggleStatus}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-[1.02] ${
                currentStatus === "In Office"
                  ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              }`}
            >
              Switch to{" "}
              {currentStatus === "In Office" ? "Out of Office" : "In Office"}
            </button>
          </div>
          {message && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-200 hover:shadow-xl">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
            Team Status
          </h2>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  user.status.status === "In Office"
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
                    : "bg-gradient-to-r from-red-50 to-rose-50 border-red-100"
                }`}
              >
                <Link
                  href={`/profile/${user.id}`}
                  className="group mb-2 sm:mb-0"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500">{user.startupName}</p>
                </Link>
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.status.status === "In Office"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status.status}
                  </span>
                  <span className="text-sm text-gray-500 mt-2 sm:mt-0">
                    Updated{" "}
                    {new Date(user.status.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Team Members
                </h3>
                <p className="text-gray-500">
                  Your team members will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
