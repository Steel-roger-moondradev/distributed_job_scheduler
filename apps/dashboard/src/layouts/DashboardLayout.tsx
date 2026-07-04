import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import Sidebar from "../components/Sidebar.js";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-white shadow-md">
        <Sidebar />
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
