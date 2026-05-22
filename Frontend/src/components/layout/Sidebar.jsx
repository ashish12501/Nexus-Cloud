import React from "react";
import {
  LayoutGrid,
  Folder,
  Users,
  Clock,
  Star,
  Trash2,
  Settings,
  LifeBuoy,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "files", label: "My Files", icon: Folder },
  { key: "shared", label: "Shared With Me", icon: Users },
  { key: "recent", label: "Recent", icon: Clock },
  { key: "favorites", label: "Favorites", icon: Star },
  { key: "trash", label: "Trash", icon: Trash2 },
];

const FOOTER_ITEMS = [
  { key: "settings", label: "Settings", icon: Settings },
  { key: "support", label: "Support", icon: LifeBuoy },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="bg-[#0b0e18] text-slate-100 border-r border-[#12162a] w-60 min-h-screen flex flex-col gap-4 px-4 py-5">
      <div className="flex items-center gap-3 rounded-xl bg-[#0f1324] border border-[#161c34] px-3 py-2.5">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-extrabold grid place-items-center">
          N
        </div>
        <div className="leading-tight">
          <div className="font-semibold tracking-wide">Nexus</div>
          <div className="text-xs text-slate-400">Personal Workspace</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect?.(item.key)}
              className={`flex items-center gap-3 w-full rounded-lg border px-3 py-2.5 text-sm transition ${
                isActive
                  ? "border-[#1e2646] bg-[#11172d] text-slate-100 shadow-inner"
                  : "border-transparent bg-transparent text-slate-300 hover:bg-[#101529] hover:text-slate-50"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <nav className="flex flex-col gap-2 mt-auto">
        {FOOTER_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect?.(item.key)}
              className={`flex items-center gap-3 w-full rounded-lg border px-3 py-2.5 text-sm transition ${
                isActive
                  ? "border-[#1e2646] bg-[#11172d] text-slate-100 shadow-inner"
                  : "border-transparent bg-transparent text-slate-300 hover:bg-[#101529] hover:text-slate-50"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
