"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";

import API from "@/utils/api";

import {
  FiUser,
  FiShield,
  FiUserCheck,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";

const Users = () => {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    currentUserRole,
    setCurrentUserRole,
  ] = useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState(null);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  /* =========================
     LOAD CURRENT USER
  ========================= */

  const loadUserData = () => {
    const storedUser =
      localStorage.getItem(
        "user"
      ) ||
      localStorage.getItem(
        "adminUser"
      );

    if (!storedUser) {
      return;
    }

    try {
      const parsed =
        JSON.parse(
          storedUser
        );

      const role = String(
        parsed?.role ||
          parsed?.user?.role ||
          ""
      )
        .trim()
        .toLowerCase();

      setCurrentUserRole(
        role
      );
    } catch (error) {
      console.error(
        "Failed to parse user data:",
        error
      );
    }
  };

  /* =========================
     FETCH USERS
  ========================= */

  const fetchUsers =
    async () => {
      setLoading(true);

      try {
        const { data } =
          await API.get(
            "/auth/users"
          );

        if (data?.success) {
          setUsers(
            Array.isArray(
              data.users
            )
              ? data.users
              : []
          );
        }
      } catch (error) {
        console.error(
          "Fetch users error:",
          error
        );

        toast.error(
          error?.response
            ?.data?.message ||
            "ইউজারদের তথ্য ফেচ করতে ব্যর্থ হয়েছে!"
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadUserData();
    fetchUsers();
  }, []);

  /* =========================
     ROLE CHANGE
  ========================= */

  const handleRoleChange =
    async (
      userId,
      newRole
    ) => {
      const normalizedRole =
        String(newRole)
          .trim()
          .toLowerCase();

      if (
        currentUserRole ===
          "moderator" &&
        normalizedRole ===
          "admin"
      ) {
        toast.error(
          "মডারেটর কাউকে Admin বানাতে পারবেন না!"
        );

        return;
      }

      if (
        currentUserRole !==
          "admin" &&
        currentUserRole !==
          "moderator"
      ) {
        toast.error(
          "আপনার রোল পরিবর্তনের অনুমতি নেই!"
        );

        return;
      }

      setUpdatingId(
        userId
      );

      try {
        const { data } =
          await API.put(
            `/auth/users/${userId}/role`,
            {
              role:
                normalizedRole,
            }
          );

        if (data?.success) {
          toast.success(
            data.message ||
              "ইউজার রোল সফলভাবে আপডেট করা হয়েছে!"
          );

          setUsers(
            (previousUsers) =>
              previousUsers.map(
                (user) =>
                  user._id ===
                  userId
                    ? {
                        ...user,
                        role:
                          normalizedRole,
                      }
                    : user
              )
          );
        }
      } catch (error) {
        toast.error(
          error?.response
            ?.data?.message ||
            "রোল পরিবর্তন করতে ব্যর্থ হয়েছে!"
        );

        await fetchUsers();
      } finally {
        setUpdatingId(null);
      }
    };

  /* =========================
     DELETE USER
  ========================= */

  const handleDeleteUser =
    async (userId) => {
      if (
        currentUserRole !==
        "admin"
      ) {
        toast.error(
          "শুধুমাত্র Admin ইউজার ডিলিট করতে পারবেন!"
        );

        return;
      }

      if (
        !window.confirm(
          "আপনি কি নিশ্চিত এই ইউজারকে ডিলিট করতে চান?"
        )
      ) {
        return;
      }

      setDeletingId(
        userId
      );

      try {
        const { data } =
          await API.delete(
            `/auth/users/${userId}`
          );

        if (data?.success) {
          toast.success(
            data.message ||
              "ইউজার সফলভাবে ডিলিট করা হয়েছে!"
          );

          setUsers(
            (previousUsers) =>
              previousUsers.filter(
                (user) =>
                  user._id !==
                  userId
              )
          );
        }
      } catch (error) {
        toast.error(
          error?.response
            ?.data?.message ||
            "ইউজার ডিলিট করতে ব্যর্থ হয়েছে!"
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

  /* =========================
     ROLE BADGE
  ========================= */

  const getRoleBadge = (
    role
  ) => {
    const formattedRole =
      String(
        role || "customer"
      )
        .trim()
        .toLowerCase();

    switch (
      formattedRole
    ) {
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
            <FiShield
              size={12}
            />
            Admin
          </span>
        );

      case "moderator":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
            <FiUserCheck
              size={12}
            />
            Moderator
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <FiUser
              size={12}
            />
            Customer
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 font-poppins">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-slate-800">

        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            User Management
          </h2>

          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {currentUserRole ===
            "admin"
              ? "সকল ইউজারের তালিকা দেখুন, রোল আপডেট করুন বা ডিলিট করুন"
              : "কাস্টমার ও মডারেটরদের তালিকা এবং রোল আপডেট করুন"}
          </p>
        </div>

        <button
          onClick={
            fetchUsers
          }
          disabled={loading}
          className="inline-flex items-center gap-2 text-xs font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <FiRefreshCw
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#eb6e1b] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">

                <th className="p-4 border-b border-gray-100 dark:border-slate-700">
                  User Info
                </th>

                <th className="p-4 border-b border-gray-100 dark:border-slate-700">
                  Email
                </th>

                <th className="p-4 border-b border-gray-100 dark:border-slate-700">
                  Role
                </th>

                <th className="p-4 border-b border-gray-100 dark:border-slate-700">
                  Joined Date
                </th>

                <th className="p-4 border-b border-gray-100 dark:border-slate-700 text-right">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm text-gray-700 dark:text-slate-300">

              {users.length >
              0 ? (
                users.map(
                  (user) => {
                    const targetRole =
                      String(
                        user.role ||
                          "customer"
                      )
                        .trim()
                        .toLowerCase();

                    const isTargetAdmin =
                      targetRole ===
                      "admin";

                    const canManage =
                      currentUserRole ===
                        "admin" ||
                      (currentUserRole ===
                        "moderator" &&
                        !isTargetAdmin);

                    return (
                      <tr
                        key={
                          user._id
                        }
                        className="hover:bg-gray-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">

                            {user.picture ? (
                              <img
                                src={
                                  user.picture
                                }
                                alt={
                                  user.name
                                }
                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-[#eb6e1b]/10 text-[#eb6e1b] font-bold text-sm flex items-center justify-center">
                                {user.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  "U"}
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {
                                  user.name
                                }
                              </p>

                              <p className="text-xs text-gray-400">
                                ID:{" "}
                                {user._id?.slice(
                                  -6
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-gray-600 dark:text-slate-400">
                          {
                            user.email
                          }
                        </td>

                        <td className="p-4">
                          {getRoleBadge(
                            user.role
                          )}
                        </td>

                        <td className="p-4 text-xs text-gray-500 dark:text-slate-400">
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month:
                                    "short",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </td>

                        <td className="p-4 text-right">

                          {canManage ? (
                            <div className="flex items-center justify-end gap-2">

                              <select
                                value={
                                  targetRole
                                }
                                disabled={
                                  updatingId ===
                                  user._id
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleRoleChange(
                                    user._id,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#eb6e1b] cursor-pointer disabled:opacity-50 font-medium text-gray-700 dark:text-slate-200 rounded-lg"
                              >
                                <option value="customer">
                                  Customer
                                </option>

                                <option value="moderator">
                                  Moderator
                                </option>

                                {currentUserRole ===
                                  "admin" && (
                                  <option value="admin">
                                    Admin
                                  </option>
                                )}
                              </select>

                              {currentUserRole ===
                                "admin" && (
                                <button
                                  onClick={() =>
                                    handleDeleteUser(
                                      user._id
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    user._id
                                  }
                                  title="Delete User"
                                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <FiTrash2
                                    size={
                                      14
                                    }
                                    className={
                                      deletingId ===
                                      user._id
                                        ? "animate-spin"
                                        : ""
                                    }
                                  />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              No Permission
                            </span>
                          )}

                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    কোনো ইউজার পাওয়া যায়নি!
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;