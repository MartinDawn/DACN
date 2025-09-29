import React from "react";
import Navbar from "../components/navbar";

const HomepageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#f9f6ff] text-gray-900">
    <Navbar />
    <main className="px-4 pt-28 pb-16 sm:px-6">{children}</main>
  </div>
);

export default HomepageLayout;