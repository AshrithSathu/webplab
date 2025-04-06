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

export default function OfficeDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserStatus[]>([]);
  const [error, setError] = useState("");

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
    } catch (err: any) {
      setError(err.message);
    }
  };

  const inOfficeUsers = users.filter(user => user.status.status === "In Office");
  const outOfficeUsers = users.filter(user => user.status.status === "Out of Office");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Office Status Dashboard
          </h1>
          <p className="mt-3 text-gray-600">Real-time overview of team presence</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 text-red-500 text-sm p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-green-600">
                In Office
              </h2>
              <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {inOfficeUsers.length} present
              </span>
            </div>
            <div className="space-y-4">
              {inOfficeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  <Link
                    href={`/profile/${user.id}`}
                    className="group flex-1"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{user.startupName}</p>
                  </Link>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                      Since {new Date(user.status.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {inOfficeUsers.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🏠</div>
                  <p className="text-gray-500">No one is currently in the office</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-red-600">
                Out of Office
              </h2>
              <span className="px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                {outOfficeUsers.length} away
              </span>
            </div>
            <div className="space-y-4">
              {outOfficeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  <Link
                    href={`/profile/${user.id}`}
                    className="group flex-1"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{user.startupName}</p>
                  </Link>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                      Since {new Date(user.status.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {outOfficeUsers.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎉</div>
                  <p className="text-gray-500">Everyone is in the office</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}