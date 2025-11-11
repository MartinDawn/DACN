import React from "react";
import Navbar from "../components/navbar";
// import Footer from "../components/footer";

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#f5f7fb] text-gray-900">
    <Navbar />
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6">
      {children}
    </main>
    {/* <Footer /> */}
  </div>
);

export default UserLayout;
