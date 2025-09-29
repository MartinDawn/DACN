import React from "react";
import Navbar from "../components/navbar";

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#f5f7fb] text-gray-900">
    <Navbar />
    <main className="mx-auto w-full max-w-6xl px-4 pt-40 pb-16 lg:px-0">{children}</main>
  </div>
);

export default UserLayout;
