import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-14">
        <div className="flex gap-4 py-4">
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-18">
              <LeftSidebar />
            </div>
          </aside>

          <main className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">
            <Outlet />
          </main>

          <aside className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-18">
              <RightSidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
