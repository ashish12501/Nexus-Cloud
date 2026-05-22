import React, { useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import MyFiles from "../components/Features/MyFiles";

const sectionContent = {
  dashboard: "Overview of your workspace.",
  files: "Browse and manage all your files.",
  shared: "Files shared with you.",
  recent: "Recently opened items.",
  favorites: "Pinned favorites.",
  trash: "Deleted items awaiting purge.",
  settings: "Workspace settings.",
  support: "Support and help center.",
};

export default function Dashboard() {
  const [active, setActive] = useState("files");

  const description = useMemo(() => sectionContent[active] || "", [active]);

  const renderContent = () => {
    if (active === "files") return <MyFiles />;
    return (
      <div className="rounded-2xl border border-[#161c34] bg-[#0f1324] p-6 text-slate-200">
        {description || "Content coming soon."}
      </div>
    );
  };

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-[#05070f] text-slate-100">
      <Sidebar active={active} onSelect={setActive} />

      <main className="relative flex flex-col gap-4 bg-gradient-to-br from-[#0a0d17] via-[#0b0f1c] to-[#0a0d17] px-5 py-4">
        <Header onUpload={() => {}} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold capitalize">
              {active === "files" ? "My Files" : active}
            </h2>
            <p className="text-sm text-slate-400">{description}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-lg border border-[#1d2342] bg-[#11172d] text-slate-200"
              aria-label="Grid view"
            >
              ■
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-lg border border-transparent bg-[#0f1324] text-slate-400"
              aria-label="List view"
            >
              ≣
            </button>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
