"use client";

import { Plus, Trash2 } from "lucide-react";
import { MATCH_MODES, SEARCH_FIELDS, labelForField } from "./searchConfig";

export function createAdvancedRow(operator = "AND") {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, operator, field: "", mode: "contains", value: "" };
}

export default function AdvancedSearchFields({ rows, onChange }) {
  const selectedFields = new Set(rows.map((row) => row.field).filter(Boolean));
  const availableFields = SEARCH_FIELDS.filter((field) => !selectedFields.has(field));

  function updateRow(index, key, value) {
    onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value } : row));
  }

  function removeRow(index) {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="space-y-3">
      {!rows.length && (
        <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-slate-600">Add a field to build an advanced search.</p>
        </div>
      )}
      {rows.map((row, index) => {
        const options = [...availableFields];
        if (row.field && !options.includes(row.field)) options.unshift(row.field);
        return (
          <div key={row.id || `${row.field}-${index}`} className="grid gap-3 rounded-2xl border border-blue-100 bg-white p-4 sm:grid-cols-[100px_minmax(150px,1fr)_150px_minmax(160px,1.2fr)_44px] sm:items-center">
            <label className="text-xs font-bold text-slate-500">
              {index === 0 ? "Join" : "Match"}
              <select value={row.operator || "AND"} onChange={(event) => updateRow(index, "operator", event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-400">
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            </label>
            <label className="text-xs font-bold text-slate-500">
              Field
              <select value={row.field || ""} onChange={(event) => updateRow(index, "field", event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-semibold text-[#003466] outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Select a field</option>
                {options.map((field) => <option key={field} value={field}>{labelForField(field)}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-500">
              Match type
              <select value={row.mode || "contains"} onChange={(event) => updateRow(index, "mode", event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-400">
                {MATCH_MODES.map((mode) => <option key={mode} value={mode}>{labelForField(mode)}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-500">
              Value
              <input value={row.value || ""} onChange={(event) => updateRow(index, "value", event.target.value)} disabled={!row.field} placeholder={row.field ? `Enter ${labelForField(row.field)}` : "Select a field first"} className="mt-1 h-11 w-full rounded-xl border border-blue-100 bg-white px-4 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400 disabled:bg-slate-50" />
            </label>
            <button type="button" onClick={() => removeRow(index)} aria-label="Remove field" className="flex h-11 w-11 items-center justify-center self-end rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50"><Trash2 size={17} /></button>
          </div>
        );
      })}
      {availableFields.length > 0 && (
        <button type="button" onClick={() => onChange([...rows, createAdvancedRow(rows.length ? rows[rows.length - 1].operator || "AND" : "AND")])} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100">
          <Plus size={16} /> Add field
        </button>
      )}
      {!availableFields.length && rows.length > 0 && <p className="text-xs font-medium text-slate-500">All available fields have been added.</p>}
    </div>
  );
}
