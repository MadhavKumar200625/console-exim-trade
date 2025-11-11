"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Home,
  Briefcase,
  Download,
  CreditCard,
  BarChart3,
  User,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const tabs = [
  { name: "Home", icon: Home, href: "/" },
  { name: "My Workspace", icon: Briefcase, href: "/workspace" },
  { name: "My Downloads", icon: Download, href: "/mydownloads" },
  { name: "Subscription", icon: CreditCard, href: "/subscription" },

  { name: "My Account", icon: User, href: "/user-profile" },
];

export default function Header() {
  const [username] = useState("Madhav Kumar");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-[#00264d] text-white shadow-lg z-50 relative">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* LEFT IDENTITY SECTION */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2 cursor-pointer hover:text-blue-300 transition-all">
            <User size={22} />
            <div className="hidden sm:block">
              <p className="text-xs opacity-70 leading-tight">Hello,</p>
              <p className="font-semibold text-sm">{username}</p>
            </div>
          </div>
        </motion.div>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-6">
          {tabs.map(({ name, icon: Icon, href }) => (
            <Link key={name} href={href}>
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 text-sm font-medium opacity-80 hover:opacity-100 transition relative"
              >
                <Icon size={18} />
                <span>{name}</span>
                {/* Hover underline */}
                <motion.span
                  className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-blue-400"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* RIGHT STATS + MENU */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <Download size={16} className="text-blue-300" />
              <span className="opacity-80">16 / 1000</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Search size={16} className="text-blue-300" />
              <span className="opacity-80">10 / 1000</span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md hover:bg-blue-900/30 transition"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU (Slide Down) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#003466] border-t border-white/10 flex flex-col gap-4 py-4 px-6 text-sm shadow-inner"
          >
            {tabs.map(({ name, icon: Icon, href }) => (
              <Link
                key={name}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-2 rounded-md hover:bg-white/10 transition-all"
              >
                <Icon size={18} className="text-blue-300" />
                <span>{name}</span>
              </Link>
            ))}

            {/* Stats for Mobile */}
            <div className="flex justify-around mt-4 border-t border-white/10 pt-4 text-xs">
              <div className="flex items-center gap-1">
                <Download size={14} className="text-blue-300" />
                <span>16 / 1000</span>
              </div>
              <div className="flex items-center gap-1">
                <Search size={14} className="text-blue-300" />
                <span>10 / 1000</span>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}