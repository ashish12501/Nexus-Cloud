import React from "react";
import { Bell, Upload, Search, Settings, HelpCircle } from "lucide-react";

export default function Header({ onUpload }) {
  return (
    <header className="flex items-center gap-3 justify-between w-full">
      <div className="flex items-center gap-3 flex-1 rounded-xl border border-[#161c34] bg-[#0f1324] px-3 py-2 text-slate-300">
        <Search size={18} />
        <input
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          type="text"
          placeholder="Search your workspace..."
          aria-label="Search"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-200 text-[#0b0e18] font-semibold px-3 py-2 shadow-[0_10px_30px_rgba(136,133,255,0.35)]"
        >
          <Upload size={16} />
          <span>Upload</span>
        </button>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-[#161c34] bg-[#0f1324] text-slate-200"
          type="button"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-[#161c34] bg-[#0f1324] text-slate-200"
          type="button"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-[#161c34] bg-[#0f1324] text-slate-200"
          type="button"
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
