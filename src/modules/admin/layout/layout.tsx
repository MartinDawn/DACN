import React, { useState, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// Icons for Layout
const DashboardIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>);
// const CalendarIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
// const ProfileIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const FormIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const TableIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7-9h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2z" /></svg>);
// const PageIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>);
const UsersIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const BookOpenIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>);
const ChartPieIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>);
const SearchIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>);
const BellIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>);
const MenuIcon = () => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>);
const ChevronDown = () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>);
const MoonIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeMax="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>);
const MessageIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>);

interface SidebarItemProps {
    icon: any;
    label: string;
    isActive?: boolean;
    hasSubmenu?: boolean;
    isExpanded?: boolean;
}

const SidebarItem = ({ icon: Icon, label, isActive = false, hasSubmenu = false, isExpanded = true }: SidebarItemProps) => (
  <div
    className={`group flex items-center gap-3 rounded-2xl py-2.5 px-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-purple-50 text-[#5a2dff] shadow-[0_12px_30px_rgba(90,45,255,0.15)]'
        : 'text-gray-500 hover:bg-purple-50 hover:text-[#5a2dff]'
    } ${!isExpanded ? 'justify-center px-0' : ''}`}
  >
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
        isActive
          ? 'bg-purple-100 text-[#5a2dff]'
          : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-[#5a2dff]'
      }`}
    >
      <Icon />
    </span>
    {isExpanded && <span className="truncate flex-1">{label}</span>}
    {isExpanded && hasSubmenu && (
      <span
        className={`ml-auto text-xs transition-colors ${
          isActive ? 'text-[#5a2dff]' : 'text-gray-400 group-hover:text-[#5a2dff]'
        }`}
      >
        <ChevronDown />
      </span>
    )}
  </div>
);

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const location = useLocation();

  const toggleSidebar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.innerWidth >= 1024) {
        setSidebarExpanded(!sidebarExpanded);
    } else {
        setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FF] font-sans text-gray-900">
      {/* Sidebar */}
      <aside
        className={`absolute left-0 top-0 z-50 flex h-screen flex-col overflow-y-hidden border-r border-gray-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.05)] duration-300 ease-linear lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarExpanded ? 'lg:w-72.5' : 'lg:w-20'} w-72.5`}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center gap-2 py-6 ${sidebarExpanded ? 'px-6 justify-between' : 'justify-center'}`}>
          <NavLink to="/admin/dashboard" className="flex items-center gap-3">
            <div className="bg-[#5a2dff] p-2 rounded-lg text-white flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            {sidebarExpanded && <span className="text-xl font-semibold tracking-tight text-[#5a2dff] duration-300 ease-in-out">EduViet</span>}
          </NavLink>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block text-gray-500 transition-colors hover:text-[#5a2dff] lg:hidden"
          >
             <MenuIcon />
           </button>
        </div>

        {/* Sidebar Menu */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
            <div>
              <h3 className={`mb-3 ml-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 ${!sidebarExpanded && 'hidden'}`}>Danh mục</h3>
              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <NavLink to="/admin/dashboard">
                    <SidebarItem 
                      icon={DashboardIcon} 
                      label="Dashboard" 
                      isActive={location.pathname === '/admin/dashboard'} 
                      isExpanded={sidebarExpanded}
                    />
                  </NavLink>
                </li>
                {/* <li><SidebarItem icon={CalendarIcon} label="Lịch" isExpanded={sidebarExpanded}/></li> */}
                <li>
                  <NavLink to="/admin/users">
                    <SidebarItem 
                      icon={UsersIcon} 
                      label="Quản lý người dùng" 
                      isActive={location.pathname === '/admin/users'} 
                      isExpanded={sidebarExpanded}
                    />
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/courses">
                    <SidebarItem 
                      icon={BookOpenIcon} 
                      label="Quản lý khóa học" 
                      isActive={location.pathname === '/admin/courses'} 
                      isExpanded={sidebarExpanded}
                    />
                  </NavLink>
                </li>
                {/* <li><SidebarItem icon={ProfileIcon} label="Hồ sơ người dùng" isExpanded={sidebarExpanded}/></li> */}
                <li><SidebarItem icon={FormIcon} label="Biểu mẫu" hasSubmenu={true} isExpanded={sidebarExpanded}/></li>
                <li><SidebarItem icon={TableIcon} label="Bảng" hasSubmenu={true} isExpanded={sidebarExpanded}/></li>
                {/* <li><SidebarItem icon={PageIcon} label="Trang" hasSubmenu={true} isExpanded={sidebarExpanded}/></li> */}
              </ul>
            </div>
            <div>
              <h3 className={`mb-3 ml-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 ${!sidebarExpanded && 'hidden'}`}>Khác</h3>
              <ul className="mb-6 flex flex-col gap-1.5">
                <li><SidebarItem icon={ChartPieIcon} label="Biểu đồ" hasSubmenu={true} isExpanded={sidebarExpanded}/></li>
                <li><SidebarItem icon={FormIcon} label="Giao diện UI" hasSubmenu={true} isExpanded={sidebarExpanded}/></li>
                <li><SidebarItem icon={FormIcon} label="Xác thực" hasSubmenu={true} isExpanded={sidebarExpanded}/></li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      {/* Content Area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex w-full border-b border-gray-200 bg-white/80 backdrop-blur">
          <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-sm md:px-6 2xl:px-11">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleSidebar}
                className="z-50 block rounded-full border border-gray-200 bg-white p-2 shadow-sm"
              >
                 <MenuIcon />
               </button>
            </div>
            {/* Search */}
            <div className={`hidden sm:block transition-all duration-300 ${!sidebarExpanded ? 'ml-0' : ''}`}>
              <form action="#" method="POST">
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                     <SearchIcon />
                   </span>
                  <input
                    type="text"
                    placeholder="Tìm kiếm hoặc nhập lệnh..."
                    className="w-full rounded-full border border-gray-200 bg-[#F4F7FF] py-2.5 pl-11 pr-16 text-sm font-medium text-gray-600 outline-none transition focus:border-[#5a2dff] focus:bg-white xl:w-125"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                    ⌘K
                  </span>
                </div>
              </form>
            </div>
            
            {/* Right Header */}
            <div className="flex items-center gap-3 2xsm:gap-7">
               <ul className="flex items-center gap-2 2xsm:gap-4">
                  <li>
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-gray-500 transition hover:text-[#5a2dff]">
                       <MoonIcon />
                     </button>
                  </li>
                  <li>
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-gray-500 transition hover:text-[#5a2dff]">
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                      <BellIcon />
                     </button>
                  </li>
                  <li>
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-gray-500 transition hover:text-[#5a2dff]">
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                      <MessageIcon />
                     </button>
                  </li>
               </ul>

               {/* User Area */}
               <div className="relative flex items-center gap-4">
                  <span className="hidden text-right lg:block">
                     <span className="block text-sm font-medium text-black">Nguyễn Văn A</span>
                     <span className="block text-xs font-medium text-gray-500">Quản trị viên</span>
                  </span>
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                     <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="User" />
                  </div>
                  <span className="text-gray-400">
                    <ChevronDown />
                  </span>
               </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
           {children}
        </main>
      </div>
    </div>
  );
}
