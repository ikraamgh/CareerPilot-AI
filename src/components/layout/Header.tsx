"use client";

import { MobileNav } from "./MobileNav";
import { mockUserProfile } from "@/lib/mock-data";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  pageTitle?: string;
}

export function Header({ pageTitle }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
      {/* Mobile nav trigger */}
      <MobileNav />

      {/* Page title (mobile) */}
      <h2 className="font-semibold text-slate-800 md:hidden text-sm">
        {pageTitle || "CareerPilot AI"}
      </h2>

      {/* Search (desktop) */}
      <div className="hidden md:flex flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search…"
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Notification bell */}
      <button
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
      </button>

      {/* User avatar */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {mockUserProfile.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-slate-800 leading-tight">
            {mockUserProfile.name}
          </p>
          <p className="text-[11px] text-slate-400 leading-tight">Demo Account</p>
        </div>
      </div>
    </header>
  );
}
