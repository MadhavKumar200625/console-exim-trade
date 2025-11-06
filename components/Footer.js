"use client";

import { Copyright } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#00264d] text-white py-4 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-2">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-sm opacity-80">
          <Copyright size={14} className="text-blue-300" />
          <span>
            {new Date().getFullYear()} Exim Trade Data. All rights reserved.
          </span>
        </div>

        
      </div>
    </footer>
  );
}