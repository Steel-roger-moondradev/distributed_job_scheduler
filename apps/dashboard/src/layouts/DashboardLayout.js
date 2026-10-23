import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import Sidebar from "../components/Sidebar.js";
export default function DashboardLayout() {
    return (_jsxs("div", { className: "flex h-screen overflow-hidden bg-slate-50 text-slate-900", children: [_jsx("aside", { className: "hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block", children: _jsx(Sidebar, {}) }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsx("header", { className: "shrink-0 border-b border-slate-200 bg-white", children: _jsx(Navbar, {}) }), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsx("div", { className: "mx-auto w-full max-w-[1600px] p-5 sm:p-6 lg:p-8", children: _jsx(Outlet, {}) }) })] })] }));
}
