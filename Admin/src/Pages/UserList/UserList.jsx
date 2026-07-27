// 📁 src/components/UserList.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Search, Filter, X, User as UserIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  container,
  item,
  mockdata,
  ITEMS_PER_PAGE,
} from "../../constants/mockdata";
import { fetchUser, handleDeleteUser } from "../../services/adminServices";

function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchUser();
        setUsers(response?.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchData();
  }, []);

  // Filter + Search
  const filtered = users.filter((u) => {
    const matchName = u.username.toLowerCase().includes(search.toLowerCase());
    const matchEmail = u.email.toLowerCase().includes(search.toLowerCase());
    const matchPlan = !filter || u.membershipPlan === filter;
    return (matchName || matchEmail) && matchPlan;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDelete = async (userID) => {
    console.log("userid", userID);
    const res = await handleDeleteUser(userID);
    if (res) {
      console.log("idhr hu")
      toast.success("User Deleted Sucessfully");
    }

    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userID));
    handleDeleteUser(userID);
    setConfirmDelete(null);
  };

  // Helper to clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
        <Toaster position="top-center" /> 
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 mt-20">
        <div className="relative w-full md:w-1/2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by username or email"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="relative w-full md:w-1/4">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Memberships</option>
            <option value="Premium">Premium</option>
            <option value="Non-Premium">Non-Premium</option>
          </select>
        </div>
      </div>

      {/* Filter Chips */}
      {(search || filter) && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {search && (
            <span className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium shadow hover:cursor-pointer">
              <Search size={14} className="mr-1" />"{search}"
              <button
                className="ml-2 text-blue-500 hover:text-blue-700"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                aria-label="Remove search filter"
              >
                <X size={16} />
              </button>
            </span>
          )}
          {filter && (
            <span className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium shadow hover:cursor-pointer">
              <Filter size={14} className="mr-1" />
              {filter}
              <button
                className="ml-2 text-yellow-500 hover:text-yellow-700"
                onClick={() => {
                  setFilter("");
                  setCurrentPage(1);
                }}
                aria-label="Remove membership filter"
              >
                <X size={16} />
              </button>
            </span>
          )}
          <button
            className="ml-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 shadow"
            onClick={clearAllFilters}
          >
            Clear All <X size={16} className="inline ml-1" />
          </button>
        </div>
      )}

      {/* User List */}
      {paginated.length === 0 ? (
        <div className="flex justify-center items-center min-h-[52vh] py-24 text-gray-400 text-2xl font-semibold">
          No user available
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[70vh]"
        >
          {paginated.map((user) => (
            <motion.div
              key={user.userID}
              variants={item}
              whileHover={{
                y: -3,
                scale: 1.02,
                boxShadow: "0 6px 24px 0 rgba(0,0,0,0.10)",
              }}
              className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-xl shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    onError={(e) => {
                      e.target.src = null;
                    }}
                    className="w-14 h-14 object-cover rounded-full border border-gray-200 shadow"
                  />
                ) : (
                  <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-full border border-gray-200">
                    <UserIcon className="text-gray-400" size={28} />
                  </div>
                )}
                <div>
                  <div className="text-base font-semibold font-mono tracking-wider flex items-center">
                    {search
                      ? (() => {
                          const username = user.username;
                          const searchLower = search.toLowerCase();
                          const usernameLower = username.toLowerCase();
                          const startIdx = usernameLower.indexOf(searchLower);
                          if (startIdx === -1) return username;
                          const endIdx = startIdx + search.length;
                          return (
                            <>
                              {username.slice(0, startIdx)}
                              <span className="bg-yellow-200 text-black px-1 rounded">
                                {username.slice(startIdx, endIdx)}
                              </span>
                              {username.slice(endIdx)}
                            </>
                          );
                        })()
                      : user.username}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 min-w-[120px]">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm border ${
                    user.membershipPlan === "Premium"
                      ? "bg-yellow-200 text-yellow-900 border-yellow-300"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {user.membershipPlan}
                </span>
                <button
                  onClick={() => setConfirmDelete(user)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition"
                  title="Delete user"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-between items-center mt-8 gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600 font-medium">
            Page <span className="font-bold">{currentPage}</span> of{" "}
            <span className="font-bold">{totalPages}</span>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-5 py-2 bg-blue-500 text-white rounded-lg font-semibold shadow hover:bg-blue-600 transition disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[90%] max-w-md border border-gray-100">
            <h3 className="text-xl font-bold mb-3 text-red-600 flex items-center gap-2">
              <Trash2 size={20} /> Confirm Delete
            </h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete{" "}
              <strong className="text-black">{confirmDelete.username}</strong>?
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                onClick={() => handleDelete(confirmDelete._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
