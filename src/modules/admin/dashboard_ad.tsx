import React, { useState } from 'react';
import AdminLayout from './layout/layout';

// Icons - Dashboard Specific
const UserIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const AcademicCapIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>);
const CheckCircleIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ClockIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const TrendingUpIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
const TagIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>);

const DotsIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>);
const ArrowUpIcon = () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>);
const ArrowDownIcon = () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>);

// CardDataStats component remains the same
const CardDataStats = ({ title, total, rate, levelUp, children }: any) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-[#5a2dff]"> {/* Đổi sang tím 5a2dff */}
        {children}
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <h4 className="mt-1 text-3xl font-semibold text-gray-900">{total}</h4>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            levelUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
          }`}
        >
          {levelUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
          {rate}
        </span>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  return (
    <AdminLayout>
       <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
             <CardDataStats title="Tổng học viên" total="3,782" rate="12.5%" levelUp={true}>
                 <UserIcon />
             </CardDataStats>
             <CardDataStats title="Giảng viên" total="156" rate="4.3%" levelUp={true}>
                 <AcademicCapIcon />
             </CardDataStats>
             <CardDataStats title="Khóa học đã duyệt" total="1,245" rate="2.1%" levelUp={false}>
                 <CheckCircleIcon />
             </CardDataStats>
             <CardDataStats title="Chờ xét duyệt" total="45" rate="5.4%" levelUp={true}>
                 <ClockIcon />
             </CardDataStats>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
              
              {/* Chart 1: Course Sales & Revenue */}
              <div className="col-span-12 xl:col-span-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
                  <div className="flex justify-between mb-4">
                       <div>
                           <h4 className="text-xl font-bold text-black">Doanh số & Doanh thu</h4>
                           <p className="text-xs text-gray-500">Khóa học đã bán vs Doanh thu theo tháng</p>
                       </div>
                       <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2 text-xs">
                               <span className="block w-3 h-3 rounded-full bg-[#5a2dff]"></span> Bán hàng
                           </div>
                           <div className="flex items-center gap-2 text-xs">
                               <span className="block w-3 h-3 rounded-full bg-green-500"></span> Doanh thu
                           </div>
                       </div>
                  </div>
                  
                  {/* Grouped Bar Chart with Tooltips */}
                  <div className="h-[300px] w-full flex items-end justify-between gap-2 pt-10 pb-2 px-2 border-b border-gray-100">
                        {([
                            {s: 40, r: 35}, {s: 70, r: 60}, {s: 45, r: 55}, {s: 65, r: 40}, 
                            {s: 50, r: 65}, {s: 55, r: 75}, {s: 65, r: 50}, {s: 40, r: 60}, 
                            {s: 50, r: 70}, {s: 85, r: 80}, {s: 60, r: 55}, {s: 45, r: 40}
                        ]).map((d, i) => {
                            const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
                            const shortMonths = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
                            const salesCount = Math.floor(d.s * 4.2);
                            const revenueRaw = Math.floor(d.r * 1250);
                            
                            return (
                                <div key={i} className="group relative flex flex-col items-center gap-2 w-full h-full justify-end cursor-pointer">
                                    {/* TOOLTIP: Visible on group hover */}
                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block z-20 pointer-events-none">
                                        <div className="relative w-40 rounded-xl bg-gray-900 p-3 text-xs text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
                                            <p className="mb-2 border-b border-gray-700 pb-1 font-bold text-gray-300">{months[i]}</p>
                                            
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-[#5a2dff] shadow-[0_0_5px_#5a2dff]"></span>
                                                    <span className="text-gray-400">Bán hàng:</span>
                                                </div>
                                                <span className="font-semibold">{salesCount}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
                                                    <span className="text-gray-400">D.Thu:</span>
                                                </div>
                                                <span className="font-semibold text-green-400">${(revenueRaw / 1000).toFixed(1)}k</span>
                                            </div>
                                            
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -ml-1.5 -mt-1 h-3 w-3 -translate-y-1/2 rotate-45 bg-gray-900"></div>
                                        </div>
                                    </div>

                                    {/* Bars */}
                                    <div className="flex items-end gap-1 h-full w-full justify-center px-0.5">
                                        <div className="w-1.5 md:w-3 rounded-t-sm bg-[#5a2dff] transition-all duration-300 group-hover:bg-[#7048ff] group-hover:shadow-[0_0_10px_rgba(90,45,255,0.4)]" style={{ height: `${d.s}%` }}></div>
                                        <div className="w-1.5 md:w-3 rounded-t-sm bg-green-500 transition-all duration-300 group-hover:bg-green-400 group-hover:shadow-[0_0_10px_rgba(34,197,94,0.4)]" style={{ height: `${d.r}%` }}></div>
                                    </div>
                                    

                                    {/* Label */}
                                    <span className="text-[10px] font-medium text-gray-400 transition-colors group-hover:text-[#5a2dff]">
                                    {shortMonths[i]}
                                    </span>
                                </div>
                            );
                        })}
                  </div>
              </div>

               {/* Chart 2: User Registrations */}
               <div className="col-span-12 xl:col-span-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] flex flex-col justify-between group/chart2">
                  <div className="mb-4 flex flex-col justify-between">
                       <h4 className="text-xl font-bold text-black">Tổng số người dùng</h4>
                       <p className="text-sm font-medium text-gray-500">Tăng trưởng người dùng 6 tháng qua</p>
                  </div>
                  
                  <div className="relative h-64 w-full mt-4">
                       {/* SVG Chart Layer */}
                       <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                           <defs>
                             <linearGradient id="gradArea" x1="0%" y1="0%" x2="0%" y2="100%">
                               <stop offset="0%" style={{stopColor:'#5a2dff', stopOpacity:0.4}} />
                               <stop offset="100%" style={{stopColor:'#ffffff', stopOpacity:0}} />
                             </linearGradient>
                           </defs>
                           {/* Area Path: Smooth Curve */}
                           <path 
                              d="M0,100 L0,70 C15,70 15,55 20,55 S30,60 40,60 S50,35 60,35 S70,45 80,45 S90,20 100,20 L100,100 Z" 
                              fill="url(#gradArea)" 
                              stroke="none" 
                           />
                           {/* Stroke Path: Smooth Curve */}
                           <path 
                              d="M0,70 C15,70 15,55 20,55 S30,60 40,60 S50,35 60,35 S70,45 80,45 S90,20 100,20" 
                              fill="none" 
                              stroke="#5a2dff" 
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="drop-shadow-md"
                           />
                       </svg>

                       <div className="absolute top-0 right-0 z-10 pointer-events-none">
                           <span className="text-3xl font-bold block text-right text-gray-800">3,052</span>
                           <span className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-500">
                              <ArrowUpIcon />
                              +15.2% tháng này
                           </span>
                       </div>

                       {/* Interactive Points Layer */}
                       {/* Data points matching visually with SVG curve */}
                       {([
                         { x: 0, y: 70, val: 1250, label: 'Tháng 1' },
                         { x: 20, y: 55, val: 1840, label: 'Tháng 2' },
                         { x: 40, y: 60, val: 1620, label: 'Tháng 3' },
                         { x: 60, y: 35, val: 2680, label: 'Tháng 4' },
                         { x: 80, y: 45, val: 2250, label: 'Tháng 5' },
                         { x: 100, y: 20, val: 3052, label: 'Tháng 6' }
                       ]).map((point, i) => (
                           <div 
                              key={i}
                              className="absolute group/point"
                              style={{ 
                                left: `${point.x}%`, 
                                top: `${point.y}%`,
                                transform: 'translate(-50%, -50%)' // Center the dot on coordinates
                              }}
                           >
                              {/* Hover Area (Invisible but larger for easier hovering) */}
                              <div className="h-8 w-8 cursor-pointer rounded-full -m-2"></div>

                              {/* Visible Point */}
                              <div className="absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#5a2dff] shadow-md transition-all duration-200 group-hover/point:scale-150 group-hover/point:border-[#5a2dff] group-hover/point:bg-white pointer-events-none"></div>

                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden flex-col items-center group-hover/point:flex z-30 pointer-events-none">
                                   <div className="whitespace-nowrap rounded-xl bg-gray-900 px-4 py-2 text-white shadow-xl">
                                      <p className="mb-0.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{point.label}</p>
                                      <p className="text-lg font-bold">{point.val.toLocaleString()} <span className="text-xs font-normal text-gray-400">user</span></p>
                                   </div>
                                    {/* Arrow */}
                                    <div className=" -mt-1 h-2 w-2 rotate-45 bg-gray-900"></div>
                              </div>
                           </div>
                       ))}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                       <div className="rounded-2xl bg-purple-50 p-4 transition-transform hover:scale-105">
                           <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng user</span>
                           <span className="text-xl font-bold text-[#5a2dff]">45.2k</span>
                       </div>
                       <div className="rounded-2xl bg-emerald-50 p-4 transition-transform hover:scale-105">
                           <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Hoạt động</span>
                           <span className="text-xl font-bold text-emerald-600">12.5k</span>
                       </div>
                  </div>
               </div>
          </div>

          {/* Bottom Grid: Trending Courses & Tags */}
          <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
              
              {/* Trending Courses - 8 cols */}
              <div className="col-span-12 xl:col-span-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
                   <div className="mb-6 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                           <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><TrendingUpIcon /></div>
                           <h4 className="text-xl font-bold text-black">Khóa học thịnh hành</h4>
                       </div>
                       <button className="text-sm text-[#5a2dff] hover:underline">Xem tất cả</button> {/* Đổi sang tím 5a2dff */}
                   </div>
                   
                   <div className="space-y-4">
                       {([
                           { name: "The Complete React Native Course", code: "REACT2024", sales: 2345, price: 89, img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
                           { name: "Mastering Python for Data Science", code: "PYDS2024", sales: 1890, price: 99, img: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
                           { name: "UI/UX Design Masterclass", code: "UIUX101", sales: 1654, price: 79, img: "https://images.unsplash.com/photo-1586717791821-3f44a5638d0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" },
                       ]).map((course, i) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                               <div className="flex items-center gap-4">
                                   <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                                       <img src={course.img} alt={course.name} className="h-full w-full object-cover" />
                                   </div>
                                   <div>
                                       <h5 className="font-semibold text-gray-900 text-sm">{course.name}</h5>
                                       <p className="text-xs text-gray-500">{course.code}</p>
                                   </div>
                               </div>
                               <div className="text-right">
                                   <span className="block font-bold text-gray-900">${course.price}</span>
                                   <span className="text-xs text-gray-500">{course.sales} lượt bán</span>
                               </div>
                           </div>
                       ))}
                   </div>
              </div>

              {/* Trending Tags - 4 cols */}
              <div className="col-span-12 xl:col-span-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
                   <div className="mb-6 flex items-center gap-3">
                       <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><TagIcon /></div>
                       <h4 className="text-xl font-bold text-black">Thẻ thịnh hành</h4>
                   </div>

                   <div className="flex flex-wrap gap-2">
                       {([
                           { tag: "javascript", count: "12.5k" },
                           { tag: "marketing", count: "8.2k" },
                           { tag: "design", count: "7.1k" },
                           { tag: "business", count: "6.8k" },
                           { tag: "python", count: "5.4k" },
                           { tag: "ai", count: "4.9k" },
                           { tag: "finance", count: "3.2k" },
                           { tag: "photography", count: "2.8k" }
                       ]).map((item, i) => (
                           <div key={i} className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:border-[#5a2dff] hover:text-[#5a2dff] transition-colors cursor-pointer group"> {/* Đổi sang tím 5a2dff */}
                               <span>#{item.tag}</span>
                               <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px] text-gray-500 group-hover:bg-purple-100 group-hover:text-[#5a2dff]">{item.count}</span> {/* Đổi sang tím 5a2dff */}
                           </div>
                       ))}
                   </div>

                   {/* Mini Insight */}
                   <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-[#5a2dff] p-5 text-white"> {/* Đổi sang tím 5a2dff */}
                       <h5 className="font-bold text-lg mb-1">Thông tin tuần</h5>
                       <p className="text-white/80 text-sm mb-4">Các thẻ lập trình đã tăng 25% trong tuần này.</p>
                       <button className="w-full rounded-xl bg-white/20 py-2 text-sm font-semibold hover:bg-white/30 backdrop-blur-sm">Xem báo cáo</button>
                   </div>
              </div>
          </div>

        </div>
    </AdminLayout>
  );
}
