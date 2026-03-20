"use client";

import { useState } from "react";

/* ---------- SAMPLE DATA ---------- */
const data = [
  {
    code: "4202",
    value: 90.28,
    description:
      "Trunks, suit-cases, vanity cases, executive cases, brief-cases, school satchels, spectacle cases, binocular cases, camera cases, musical instrument cases, gun cases, holsters and similar containers; travelling bags, insulated food or beverages bags...",
  },
  {
    code: "4820",
    value: 4.01,
    description:
      "Registers, account books, notebooks, order books, receipt books, letter pads, memorandum pads, diaries and similar articles...",
  },
];

export default function HSCodeBreakdown() {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl p-6 shadow-sm">

      {/* HEADER */}
      <h2 className="text-lg font-semibold text-[#003466] mb-6">
        HS Code Value Distribution
      </h2>

      <div className="space-y-6">

        {data.map((item, i) => (
          <Row key={i} item={item} />
        ))}

      </div>
    </div>
  );
}

/* ---------- ROW COMPONENT ---------- */
function Row({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

      {/* LEFT SIDE */}
      <div>

        {/* LABEL */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#003466]">
            {item.code}
          </span>

          <span className="text-xs text-blue-600 font-semibold">
            {item.value}%
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="relative h-4 bg-blue-50 rounded-full overflow-hidden">

          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-700"
            style={{ width: `${item.value}%` }}
          />

          {/* GLOW EFFECT */}
          <div
            className="absolute top-0 left-0 h-full bg-white/20 blur-md"
            style={{ width: `${item.value}%` }}
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div>

        <p
          className={`text-sm text-gray-600 leading-relaxed transition-all ${
            open ? "" : "line-clamp-3"
          }`}
        >
          {item.description}
        </p>

        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-blue-600 mt-2 hover:underline"
        >
          {open ? "Show Less" : "Read More"}
        </button>
      </div>
    </div>
  );
}