import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilesAndFolders,
  goToBreadcrumb,
  openFolder,
} from "../../features/files/filesSlice";

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return "";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${sizes[i]}`;
}

function truncate(text = "", max = 32) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

export default function MyFiles() {
  const dispatch = useDispatch();
  const { folders, files, path, loading, error, currentFolderId } = useSelector(
    (state) => state.files,
  );

  useEffect(() => {
    dispatch(fetchFilesAndFolders(currentFolderId));
  }, [dispatch, currentFolderId]);

  const handleFolderClick = (folder) => {
    dispatch(openFolder({ id: folder._id, name: folder.name }));
    dispatch(fetchFilesAndFolders(folder._id));
  };

  const handleBreadcrumbClick = (index) => {
    dispatch(goToBreadcrumb(index));
    const targetId = index === 0 ? null : path[index].id;
    dispatch(fetchFilesAndFolders(targetId));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        {path.map((crumb, idx) => (
          <div key={`${crumb.name}-${crumb.id || "root"}`} className="flex items-center gap-2">
            <button
              type="button"
              className={`hover:text-slate-100 ${idx === path.length - 1 ? "font-semibold text-slate-200" : ""}`}
              onClick={() => handleBreadcrumbClick(idx)}
            >
              {crumb.name}
            </button>
            {idx < path.length - 1 && <span className="text-slate-600">/</span>}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-[#1d2342] bg-[#0f1324] p-10 text-slate-200">
          Loading...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {folders.map((folder) => (
              <button
                key={folder._id}
                type="button"
                onClick={() => handleFolderClick(folder)}
                className="flex h-40 flex-col gap-2 rounded-2xl border border-[#161c34] bg-[#0f1324] p-4 text-left shadow-[0_18px_38px_rgba(0,0,0,0.35)] hover:border-indigo-400/40"
              >
                <div className="h-10 w-12 rounded-xl bg-gradient-to-br from-indigo-300/30 to-indigo-500/50" />
                <div className="text-sm font-semibold text-slate-100 truncate">{folder.name}</div>
                <div className="text-xs text-slate-500">Folder</div>
              </button>
            ))}

            {files.map((file) => (
              <div
                key={file._id}
                className="flex h-40 flex-col gap-2 rounded-2xl border border-[#161c34] bg-[#0f1324] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.35)]"
              >
                <div className="h-10 w-12 rounded-xl bg-gradient-to-br from-emerald-300/20 to-emerald-500/40" />
                <div className="text-sm font-semibold text-slate-100 truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="text-xs text-slate-500">
                  {truncate(file.mimeType || "File", 34)} · {formatSize(file.size)}
                </div>
              </div>
            ))}

            {!folders.length && !files.length && !error && (
              <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#1f2745] bg-[#0f1324] p-6 text-center text-slate-300">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-indigo-200/10 text-xl">+</div>
                <div className="text-sm">No files yet. Drag and drop to upload.</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
