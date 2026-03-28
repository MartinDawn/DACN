// ...existing code...
import AdminLayout from './layout/layout';
import { useDashboardStats } from './hooks/useDashboardStats';
import { useTranslation } from 'react-i18next';

// Icons - Dashboard Specific
const UserIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const AcademicCapIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>);
const CheckCircleIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ClockIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const TrendingUpIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
const TagIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>);

// ...existing code...
const ArrowUpIcon = () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>);
const ArrowDownIcon = () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>);

// CardDataStats component remains the same
const CardDataStats = ({ title, total, rate, levelUp, children }: any) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 text-[#5a2dff] ring-2 ring-purple-100 group-hover:ring-4 group-hover:ring-[#5a2dff]/20 transition-all duration-300">
        {children}
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm font-medium text-gray-500">{title}</span>
          <h4 className="mt-1.5 text-3xl font-bold text-gray-900 group-hover:text-[#5a2dff] transition-colors">{total}</h4>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm ${
            levelUp ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 ring-1 ring-green-200' : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-500 ring-1 ring-red-200'
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
  const { t } = useTranslation();
  const { stats, loading } = useDashboardStats();
  
  // Helper tính chiều cao biểu đồ cột cho userGrowth
  const userGrowthData = stats?.userGrowth || [];
  const maxGrowthVal = Math.max(...userGrowthData.map(d => Math.max(d.newStudents, d.newInstructors)), 10); // Tránh chia cho 0

  // Helper tính tổng doanh thu
  const totalRevenue = stats?.revenue?.reduce((acc, curr) => acc + curr.totalRevenue, 0) || 0;

  return (
    <AdminLayout>
       <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
             <CardDataStats
                title={t('admin.dashboard.totalStudents')}
                total={loading ? "..." : stats?.stats?.totalStudents?.toLocaleString() || "0"}
                rate="--"
                levelUp={true}
             >
                 <UserIcon />
             </CardDataStats>
             <CardDataStats
                title={t('admin.dashboard.instructors')}
                total={loading ? "..." : stats?.stats?.totalInstructors?.toLocaleString() || "0"}
                rate="--"
                levelUp={true}
             >
                 <AcademicCapIcon />
             </CardDataStats>
             <CardDataStats
                title={t('admin.dashboard.approvedCourses')}
                total={loading ? "..." : stats?.stats?.approvedCourses?.toLocaleString() || "0"}
                rate="--"
                levelUp={true}
             >
                 <CheckCircleIcon />
             </CardDataStats>
             <CardDataStats
                title={t('admin.dashboard.pendingApproval')}
                total={loading ? "..." : stats?.stats?.pendingCourses?.toLocaleString() || "0"}
                rate="--"
                levelUp={false}
             >
                 <ClockIcon />
             </CardDataStats>
          </div>

          <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">

              {/* Chart 1: Users & Instructors */}
              <div className="col-span-12 xl:col-span-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
                  <div className="flex justify-between mb-6">
                       <div>
                           <h4 className="text-xl font-bold text-gray-900">{t('admin.dashboard.userInstructorStats')}</h4>
                           <p className="text-xs text-gray-500 mt-1">{t('admin.dashboard.userInstructorStatsDesc', { year: new Date().getFullYear() })}</p>
                       </div>
                       <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2 text-xs font-medium">
                               <span className="block w-3 h-3 rounded-full bg-[#5a2dff] shadow-sm"></span> {t('admin.dashboard.students')}
                           </div>
                           <div className="flex items-center gap-2 text-xs font-medium">
                               <span className="block w-3 h-3 rounded-full bg-green-500 shadow-sm"></span> {t('admin.dashboard.instructorsLabel')}
                           </div>
                       </div>
                  </div>

                  {/* Grouped Bar Chart with Tooltips */}
                  <div className="h-[300px] w-full flex items-end justify-between gap-2 pt-10 pb-2 px-2 border-b border-gray-200">
                        {userGrowthData.length > 0 ? userGrowthData.map((d, i) => {
                            const monthLabels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
                            const heightStudent = (d.newStudents / maxGrowthVal) * 100;
                            const heightInstructor = (d.newInstructors / maxGrowthVal) * 100;

                            return (
                                <div key={i} className="group relative flex flex-col items-center gap-2 w-full h-full justify-end cursor-pointer">
                                    {/* TOOLTIP: Visible on group hover */}
                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                                        <div className="relative w-44 rounded-xl bg-gray-900 p-4 text-xs text-white shadow-2xl">
                                            <p className="mb-3 border-b border-gray-700 pb-2 font-bold text-gray-200">{t('admin.dashboard.month')} {d.month}</p>

                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-[#5a2dff] shadow-[0_0_8px_#5a2dff]"></span>
                                                    <span className="text-gray-300">{t('admin.dashboard.students')}:</span>
                                                </div>
                                                <span className="font-bold text-white">{d.newStudents}</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                                                    <span className="text-gray-300">{t('admin.dashboard.instructorsLabel')}:</span>
                                                </div>
                                                <span className="font-bold text-green-300">{d.newInstructors}</span>
                                            </div>

                                            <div className="absolute top-full left-1/2 -ml-2 -mt-1 h-4 w-4 -translate-y-1/2 rotate-45 bg-gray-900"></div>
                                        </div>
                                    </div>

                                    {/* Bars */}
                                    <div className="flex items-end gap-1.5 h-full w-full justify-center px-0.5">
                                        <div className="w-2 md:w-3.5 rounded-t-md bg-gradient-to-t from-[#5a2dff] to-[#7c4dff] transition-all duration-300 group-hover:from-[#7048ff] group-hover:to-[#8f5eff] group-hover:shadow-[0_0_12px_rgba(90,45,255,0.5)]" style={{ height: `${heightStudent || 2}%` }}></div>
                                        <div className="w-2 md:w-3.5 rounded-t-md bg-gradient-to-t from-green-500 to-emerald-400 transition-all duration-300 group-hover:from-green-400 group-hover:to-emerald-300 group-hover:shadow-[0_0_12px_rgba(34,197,94,0.5)]" style={{ height: `${heightInstructor || 2}%` }}></div>
                                    </div>


                                    {/* Label */}
                                    <span className="text-[11px] font-semibold text-gray-500 transition-colors group-hover:text-[#5a2dff]">
                                    {monthLabels[d.month - 1] || d.month}
                                    </span>
                                </div>
                            );
                        }) : <p className="w-full text-center py-20 text-gray-400 text-sm">{t('admin.dashboard.loading')}</p>}
                  </div>
              </div>

               {/* Chart 2: Revenue */}
               <div className="col-span-12 xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col justify-between">
                  <div className="mb-4 flex flex-col justify-between">
                       <h4 className="text-xl font-bold text-gray-900">{t('admin.dashboard.totalRevenue')}</h4>
                       <p className="text-sm font-medium text-gray-500 mt-1">{t('admin.dashboard.revenueThisYear')}</p>
                  </div>

                  <div className="relative h-64 w-full mt-4">
                       {/* SVG Chart Layer (Giữ nguyên SVG static để đảm bảo giao diện đẹp, bạn có thể thay thế bằng Recharts để dynamic hoàn toàn) */}
                       <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                           <defs>
                             <linearGradient id="gradArea" x1="0%" y1="0%" x2="0%" y2="100%">
                               <stop offset="0%" style={{stopColor:'#5a2dff', stopOpacity:0.5}} />
                               <stop offset="100%" style={{stopColor:'#ffffff', stopOpacity:0}} />
                             </linearGradient>
                           </defs>
                           <path d="M0,100 L0,70 C15,70 15,55 20,55 S30,60 40,60 S50,35 60,35 S70,45 80,45 S90,20 100,20 L100,100 Z" fill="url(#gradArea)" stroke="none" />
                           <path d="M0,70 C15,70 15,55 20,55 S30,60 40,60 S50,35 60,35 S70,45 80,45 S90,20 100,20" fill="none" stroke="#5a2dff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg" />
                       </svg>

                       <div className="absolute top-0 right-0 z-10 pointer-events-none">
                           {/* Hiển thị doanh thu tháng gần nhất có dữ liệu */}
                           <span className="text-3xl font-bold block text-right text-gray-900">
                                {stats?.revenue?.[0]?.totalRevenue?.toLocaleString() || 0}đ
                            </span>
                           <span className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-600">
                              <ArrowUpIcon />
                              Tháng 1
                           </span>
                       </div>

                        {/* Interactive Points Layer - mapping một vài điểm tượng trưng từ dữ liệu thật nếu có */}
                       {(stats?.revenue?.slice(0, 6) || []).map((point, i) => (
                           <div
                              key={i}
                              className="absolute group/point"
                              style={{
                                left: `${(i) * 20}%`,
                                top: `${100 - ( (point.totalRevenue / (totalRevenue || 1)) * 100 ) }%`, // Vị trí y tương đối
                                transform: 'translate(0%, -50%)'
                              }}
                           >
                              {/* ...point display code omitted for brevity seeing as scale is tricky without library... */}
                           </div>
                       ))}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 text-center">
                       <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 p-5 transition-all hover:shadow-lg hover:-translate-y-1 border border-purple-100">
                           <span className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">{t('admin.dashboard.totalRevenueYear')}</span>
                           <span className="text-2xl font-bold text-[#5a2dff]">{totalRevenue.toLocaleString()} đ</span>
                       </div>
                  </div>
               </div>
          </div>

          {/* Bottom Grid: Trending Courses & Tags */}
          <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">

              {/* Trending Courses - 8 cols */}
              <div className="col-span-12 xl:col-span-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
                   <div className="mb-6 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-gradient-to-br from-yellow-50 to-amber-50 text-yellow-600 rounded-xl ring-2 ring-yellow-100"><TrendingUpIcon /></div>
                           <h4 className="text-xl font-bold text-gray-900">{t('admin.dashboard.trendingCourses')}</h4>
                       </div>
                   </div>

                   <div className="space-y-3">
                       {stats?.trendingCourses?.map((course, i) => (
                           <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50/20 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-100 hover:shadow-md group">
                               <div className="flex items-center gap-4">
                                   <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm flex-shrink-0 ring-2 ring-indigo-100 group-hover:ring-4 group-hover:ring-[#5a2dff]/20 transition-all">
                                       {course.name.charAt(0)}
                                   </div>
                                   <div>
                                       <h5 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-[#5a2dff] transition-colors">{course.name}</h5>
                                       <p className="text-xs text-gray-500 mt-0.5">ID: {course.id.substring(0,8)}...</p>
                                   </div>
                               </div>
                               <div className="text-right min-w-[110px]">
                                   <span className="block font-bold text-gray-900 group-hover:text-[#5a2dff] transition-colors">{course.revenue.toLocaleString()}đ</span>
                                   <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                                       <span className="font-medium">{course.salesCount}</span> {t('admin.dashboard.sales')}
                                   </span>
                               </div>
                           </div>
                       ))}
                       {!stats?.trendingCourses?.length && !loading && <span className="block text-center py-8 text-gray-500 text-sm italic">{t('admin.dashboard.noCourseData')}</span>}
                   </div>
              </div>

              {/* Trending Tags - 4 cols */}
              <div className="col-span-12 xl:col-span-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-all duration-300">
                   <div className="mb-6 flex items-center gap-3">
                       <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 rounded-xl ring-2 ring-indigo-100"><TagIcon /></div>
                       <h4 className="text-xl font-bold text-gray-900">{t('admin.dashboard.trendingTags')}</h4>
                   </div>

                   <div className="flex flex-wrap gap-2">
                       {stats?.trendingTags?.map((item, i) => (
                           <div key={i} className="flex items-center gap-2 rounded-full border-2 border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-600 hover:border-[#5a2dff] hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-[#5a2dff] transition-all duration-200 cursor-pointer group hover:shadow-md">
                               <span>#{item.name}</span>
                               <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 group-hover:bg-purple-100 group-hover:text-[#5a2dff]">{item.usageCount}</span>
                           </div>
                       ))}
                   </div>

                   {/* Mini Insight */}
                   <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-[#5a2dff] p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                       <h5 className="font-bold text-lg mb-2">{t('admin.dashboard.weeklyInfo')}</h5>
                       <p className="text-white/90 text-sm mb-5 leading-relaxed">{t('admin.dashboard.weeklyInfoDesc')}</p>
                       <button className="w-full rounded-xl bg-white/20 py-2.5 text-sm font-bold hover:bg-white/30 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">{t('admin.dashboard.viewReport')}</button>
                   </div>
              </div>
          </div>

        </div>
    </AdminLayout>
  );
}
