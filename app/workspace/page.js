"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";

function parseFields(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [String(value)];
  } catch {
    return String(value).split(",").map((field) => field.trim()).filter(Boolean);
  }
}

export default function WorkspacePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [showComments, setShowComments] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const perPage = 4;

  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    fetch("/api/user/workspace")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load your saved workspaces.");
        return response.json();
      })
      .then((data) => {
        const next = (data?.workspaces || []).map((item) => ({
          ...item,
          fields: parseFields(item.fields),
          comments: item.comment ? [item.comment] : [],
        }));
        setWorkspaces(next);
      })
      .catch((fetchError) => setLoadError(fetchError.message))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(workspaces.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const visibleData = workspaces.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleDelete = async (id) => {
    setDeleting(true);
    setError("");
    try {
      const response = await fetch("/api/user/workspace", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to delete workspace.");
      setWorkspaces((prev) => prev.filter((workspace) => String(workspace.id) !== String(id)));
      setConfirmDelete(null);
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete workspace.");
    } finally {
      setDeleting(false);
    }
  };

  function openDetails(workspace) {
    setSelectedWorkspace(workspace);
    setShowDetails(true);
  }

  function openWorkspace(workspace) {
    const params = new URLSearchParams();
    const comment = workspace.comments?.[0] || "";

    try {
      const filters = JSON.parse(comment);
      const query =
        filters.HS_Code ||
        filters.Product_Description ||
        filters.Importer_Name ||
        filters.Exporter_Name ||
        workspace.name;
      params.set("suggestQuery", query);
      params.set("suggestType", filters.HS_Code ? "hscode" : "industry");
    } catch {
      params.set("suggestQuery", workspace.name || "");
      params.set("suggestType", "industry");
    }

    if (workspace.startDate) params.set("suggestFrom", workspace.startDate);
    if (workspace.endDate) params.set("suggestTo", workspace.endDate);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f5f9ff] to-[#eaf3ff] px-4 sm:px-6 md:px-10 py-8 md:py-10 text-[#003466] relative overflow-hidden">
      {/* Floating Gradient Blur */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 sm:left-32 w-60 sm:w-72 h-60 sm:h-72 bg-blue-200/40 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-20 right-10 sm:right-32 w-72 h-72 bg-blue-300/40 blur-[110px] rounded-full"></div>
      </div>

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 px-4"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-snug">
          <span className="text-[#007bff]">My Workspace</span> — Favorite Shipments
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
          View, manage, and collaborate on your saved shipment data collections.
        </p>
      </motion.div>

      {/* WORKSPACE CARDS */}
      {error && <p role="alert" className="mx-auto mb-5 max-w-7xl rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8  mx-auto">
        {loading ? (
          <div className="col-span-full rounded-2xl border border-white/70 bg-white/80 p-10 text-center text-sm font-semibold text-blue-700 shadow-lg">Loading saved workspaces…</div>
        ) : loadError ? (
          <div role="alert" className="col-span-full rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center text-sm font-semibold text-rose-800 shadow-lg">{loadError}</div>
        ) : visibleData.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/70 bg-white/80 p-10 text-center text-sm font-semibold text-gray-500 shadow-lg">
            No saved tables found.
          </div>
        )}
        {visibleData.map((ws, index) => (
          <motion.div
            key={ws.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-lg border border-white/70 rounded-2xl shadow-lg hover:shadow-xl transition-all p-5 sm:p-6 flex flex-col justify-between"
          >
            {/* Card Header */}
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Star className="text-blue-500 shrink-0" size={18} />
                <h3 className="font-semibold text-base sm:text-lg wrap-break-words shrink-0">{ws.name}</h3>
              </div>

              {/* Action Icons */}
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    setSelectedWorkspace(ws);
                    setShowComments(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="View Comments"
                >
                  <MessageSquare size={18} />
                </button>
                <button
                  onClick={() => setConfirmDelete(ws.id)}
                  className="text-red-500 hover:text-red-700 transition"
                  title="Delete Workspace"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600 mb-3">
              <Calendar size={14} className="text-blue-500 shrink-0" />
              <span className="truncate">
                {ws.startDate} → {ws.endDate}
              </span>
            </div>

            {/* Fields */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ws.fields.map((f, i) => (
                <span
                  key={i}
                  className="text-[11px] sm:text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Footer / Action */}
            <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-200 flex-wrap gap-3">
              <button
                onClick={() => openDetails(ws)}
                className="flex items-center gap-2 text-xs sm:text-sm text-blue-700 cursor-pointer hover:text-blue-900"
              >
                <FileText size={14} /> View Details
              </button>
              <motion.button
                onClick={() => openWorkspace(ws)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-linear-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-md hover:shadow-lg"
              >
                Open Workspace
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-10 flex-wrap">
        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={currentPage === 1}
          onClick={() => setPage((p) => Math.max(Math.min(p, totalPages) - 1, 1))}
          className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm ${
            page === 1
              ? "opacity-40 cursor-not-allowed"
              : "border-blue-300 text-blue-700 hover:bg-blue-50"
          }`}
        >
          <ChevronLeft size={16} /> Prev
        </motion.button>

        <span className="text-xs sm:text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={currentPage === totalPages}
          onClick={() => setPage((p) => Math.min(Math.min(p, totalPages) + 1, totalPages))}
          className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm ${
            page === totalPages
              ? "opacity-40 cursor-not-allowed"
              : "border-blue-300 text-blue-700 hover:bg-blue-50"
          }`}
        >
          Next <ChevronRight size={16} />
        </motion.button>
      </div>

      {/* COMMENTS MODAL */}
      <AnimatePresence>
        {showComments && selectedWorkspace && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-lg sm:max-w-xl overflow-y-auto max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-[#003466] wrap-break-wordsshrink-0s">
                  Comments — {selectedWorkspace.name}
                </h2>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-500 hover:text-blue-600 transition"
                >
                  <X size={22} />
                </button>
              </div>

              {selectedWorkspace.comments.length > 0 ? (
                <ul className="space-y-3 text-gray-700 text-sm sm:text-base">
                  {selectedWorkspace.comments.map((c, i) => (
                    <li
                      key={i}
                      className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILS MODAL */}
      <AnimatePresence>
        {showDetails && selectedWorkspace && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl overflow-y-auto max-h-[80vh]"
            >
              <div className="flex justify-between items-start gap-4 mb-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#003466]">
                    {selectedWorkspace.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedWorkspace.startDate || "-"} to {selectedWorkspace.endDate || "-"}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-blue-600 transition"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mb-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Saved Columns
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedWorkspace.fields.length ? (
                    selectedWorkspace.fields.map((field) => (
                      <span
                        key={field}
                        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        {field}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No columns saved.</span>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Saved Filters
                </p>
                <pre className="max-h-60 overflow-auto rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-slate-700">
                  {selectedWorkspace.comments?.[0] || "No filters saved."}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center"
            >
              <h2 className="text-lg font-semibold text-[#003466] mb-3">
                Delete Workspace?
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to delete this workspace? This action
                cannot be undone.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  disabled={deleting}
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  disabled={deleting}
                  onClick={() => handleDelete(confirmDelete)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-60"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
