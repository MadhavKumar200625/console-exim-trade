"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Building2,
  Globe,
  Lock,
  Eye,
  EyeOff,
  User,
  X,
} from "lucide-react";

export default function UserProfile() {
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f5f9ff] to-[#eaf3ff] text-[#003466] px-6 md:px-12 py-10 relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-32 w-80 h-80 bg-blue-200/40 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-20 right-32 w-96 h-96 bg-blue-300/40 blur-[130px] rounded-full"></div>
      </div>

      {/* WELCOME SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto mb-12"
      >
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">Welcome Back, <span className="text-[#007bff]">Madhav</span></h1>
          <p className="text-gray-600 text-base md:text-lg max-w-lg leading-relaxed">
            Explore the best global trade intelligence platform. Discover 200+ countries trade data reports, importers, exporters, product lists by HS Code, quantity & price.
          </p>
        </div>
        <motion.img
          src="https://console.eximtradedata.com/images/account-card.svg"
          alt="Profile Illustration"
          className="w-40 h-40 sm:w-56 sm:h-56 rounded-full object-cover shadow-lg border-4 border-blue-200"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
      </motion.div>

      {/* DETAILS SECTION */}
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-lg border border-white/70 shadow-lg rounded-2xl p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-[#003466] flex items-center gap-2">
          <User size={22} /> Profile Details
        </h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500 text-sm mb-1">Contact Person Name</p>
            <div className="flex items-center gap-2 font-medium">
              <User size={18} className="text-blue-500" /> Madhav Kumar
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">Contact Number</p>
            <div className="flex items-center gap-2 font-medium">
              <Phone size={18} className="text-blue-500" /> +91 9876543210
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">Company Name</p>
            <div className="flex items-center gap-2 font-medium">
              <Building2 size={18} className="text-blue-500" /> Nehru World Trading Co.
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">Country</p>
            <div className="flex items-center gap-2 font-medium">
              <Globe size={18} className="text-blue-500" /> India
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">Business Email</p>
            <div className="flex items-center gap-2 font-medium break-all">
              <Mail size={18} className="text-blue-500" /> madhav@example.com
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">Password</p>
            <div className="flex items-center gap-2 font-medium">
              <Lock size={18} className="text-blue-500" />
              <span>
                {showPassword ? "SuperSecure123!" : "••••••••••••"}
              </span>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-blue-500 hover:text-blue-700 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* CHANGE PASSWORD BUTTON */}
        <div className="flex justify-end mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowChangePassword(true)}
            className="px-5 py-2 text-sm sm:text-base bg-linear-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-md hover:shadow-lg"
          >
            Change Password
          </motion.button>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {showChangePassword && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#003466]">
                  Change Password
                </h3>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Old Password</p>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    value={form.oldPassword}
                    onChange={(e) =>
                      setForm({ ...form, oldPassword: e.target.value })
                    }
                  />
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1">New Password</p>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm({ ...form, newPassword: e.target.value })
                    }
                  />
                </div>

                <div>
                  <p className="text-gray-600 text-sm mb-1">Confirm New Password</p>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Password changed!");
                    setShowChangePassword(false);
                  }}
                  className="px-5 py-2 bg-linear-to-r from-blue-500 to-blue-700 text-white rounded-lg text-sm hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}