"use client";

import { useState } from "react";
import {
  ChevronDown,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import AboutCompany from "./AboutCompany";
import Analytics from "./Analytics";
import MarketPartners from "./MarketPartners";
import PortAnalysis from "./PortAnalysis";
import SimilarBuyers from "./SimilarBuyers";

/* ---------- TABS CONFIG ---------- */
const tabs = [
  "About Us",
  "Analytics",
  "Market And Partners",
  "Port Analysis",
  "Nexus",
  "Similar Buyers",
  "Contact Us",
];

/* ---------- DUMMY COMPONENTS ---------- */
const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case "About Us":
      return <AboutCompany/>;
    case "Analytics":
      return <Analytics/>;
    case "Market And Partners":
      return <MarketPartners />;
    case "Port Analysis":
      return <PortAnalysis/>
    case "Similar Buyers":
      return <SimilarBuyers/>
    case "Nexus":
      return <div className="p-6">Nexus Content</div>;
    case "Contact Us":
      return <div className="p-6">Contact Us Content</div>;
    default:
      return <AboutCompany/>;
  }
};

export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState("About Us");

  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("India");
  const [range, setRange] = useState("3M");

  const [showCurrency, setShowCurrency] = useState(false);
  const [showCountry, setShowCountry] = useState(false);

  const currencies = ["USD", "INR", "EUR"];
  const countries = ["India", "USA", "Germany"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f9ff] to-[#eaf3ff] px-6 py-6">

      {/* ================= HEADER ================= */}
      <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl p-6 shadow-sm mb-6">

        {/* TOP ROW */}
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* LEFT */}
          {/* LEFT */}
<div className="flex items-center gap-4">

  {/* BACK BUTTON */}
  <button className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center hover:scale-105 transition shadow-sm">
    <ArrowLeft size={18} className="text-blue-700" />
  </button>

  {/* COMPANY INFO */}
  <div className="flex flex-col gap-1">

    {/* COMPANY NAME */}
    <h1 className="text-2xl font-bold text-[#003466] leading-tight tracking-tight">
      GUSTI LEDER FULFILLMENT
      <span className="ml-2 text-gray-400 font-medium text-lg">
        SP Z O O
      </span>
    </h1>

    {/* SUB INFO */}
    <div className="flex items-center gap-3 mt-1">

      {/* COUNTRY BADGE */}
      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">

        {/* FLAG */}
        <img
          src="https://flagcdn.com/w40/pl.png"
          alt="Poland"
          className="w-5 h-5 rounded-full object-cover"
        />

        {/* COUNTRY */}
        <span className="text-sm font-medium text-blue-700">
          Poland
        </span>
      </div>

      {/* TYPE */}
      <span className="text-sm text-gray-500">
        Buyer Profile
      </span>

      {/* STATUS DOT */}
      <span className="flex items-center gap-1 text-xs text-green-600">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        Active
      </span>

    </div>
  </div>
</div>

          {/* RIGHT CONTROLS */}
          <div className="flex flex-wrap items-center gap-3">

            {/* CURRENCY */}
            <div className="relative">
              <button
                onClick={() => setShowCurrency(!showCurrency)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-lg text-sm shadow-sm hover:bg-blue-50"
              >
                {currency}
                <ChevronDown size={14} />
              </button>

              {showCurrency && (
                <div className="absolute top-11 right-0 bg-white border rounded-lg shadow z-50">
                  {currencies.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        setShowCurrency(false);
                      }}
                      className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* COUNTRY */}
            <div className="relative">
              <button
                onClick={() => setShowCountry(!showCountry)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-lg text-sm shadow-sm hover:bg-blue-50"
              >
                {country}
                <ChevronDown size={14} />
              </button>

              {showCountry && (
                <div className="absolute top-11 right-0 bg-white border rounded-lg shadow z-50">
                  {countries.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        setCountry(c);
                        setShowCountry(false);
                      }}
                      className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RANGE */}
            <div className="flex bg-blue-50 rounded-full px-3 py-1 text-sm">
              {["1M", "3M", "6M", "1Yr"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-2 ${
                    range === r
                      ? "text-blue-700 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* DATE */}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm shadow">
              Jan 1, 2026 — Mar 9, 2026
              <Calendar size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="bg-white/70 backdrop-blur-xl border border-blue-100 rounded-xl p-2 flex gap-2 overflow-x-auto mb-6">

        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition
              ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow"
                  : "text-blue-700 hover:bg-blue-50"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================= CONTENT ================= */}
      <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-sm min-h-[400px]">
        <TabContent activeTab={activeTab} />
      </div>
    </div>
  );
}