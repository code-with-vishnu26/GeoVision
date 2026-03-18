import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/dashboard/AppSidebar";
import TopNav from "@/components/dashboard/TopNav";
import Breadcrumb from "@/components/shared/Breadcrumb";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
