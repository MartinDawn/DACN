import React from "react";
import Navbar from "../components/navbar";

interface AvatarLayoutProps {
  children: React.ReactNode;
}

const AvatarLayout: React.FC<AvatarLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-[#f5f6fb] text-gray-900">
    <Navbar />
    <main className="pt-28">
      <div className="mx-auto w-full max-w-7xl px-8 pb-16">{children}</div>
    </main>
  </div>
);

export default AvatarLayout;
