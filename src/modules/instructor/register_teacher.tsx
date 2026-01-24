import React from "react";
import { useNavigate, Link } from "react-router-dom";
import UserLayout from "../user/layout/layout";
import { 
	ArrowLeft, 
	Users, 
	BookOpen, 
	DollarSign, 
	Globe, 
	TrendingUp, 
	Clock, 
	Target, 
	Zap, 
	Handshake 
} from "lucide-react";

export default function RegisterTeacherPage() {
	const navigate = useNavigate();

	const goToForm = () => {
		navigate("/instructor/register-teacher/form");
	};

	return (
		<UserLayout>
			<div className="space-y-8">
				<Link
					to="/user/home"
					className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
				>
					<ArrowLeft className="h-4 w-4" />
					Quay lại trang chủ
				</Link>
				{/* Hero */}
				<section className="relative overflow-hidden rounded-b-2xl">
					<div className="bg-gradient-to-r from-[#8b3cff] via-[#6e3bff] to-[#1768ff] py-24 text-center text-white">
						<div className="mx-auto max-w-4xl px-4">
							<span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
								Cơ hội nghề nghiệp
							</span>
							<h1 className="mt-6 text-4xl font-semibold leading-tight">
								Trở thành Giảng viên tại EduViet
							</h1>
							<p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
								Chia sẻ kiến thức của bạn với hàng triệu học viên trên toàn thế giới và tạo thu nhập thụ
								động từ việc giảng dạy trực tuyến.
							</p>

							{/* CTA */}
							<div className="mx-auto mt-8 flex max-w-md items-center gap-4 justify-center">
								<button
									onClick={goToForm} // điều hướng tới trang form mới
									className="flex items-center justify-center rounded-full bg-white/95 px-6 py-3 text-sm font-semibold text-[#5a2dff] shadow hover:brightness-95"
								>
									Đăng ký ngay
								</button>
					
							</div>
						</div>
					</div>

					{/* Stats cards overlapping */}
					<div className="mx-auto -mt-12 flex max-w-5xl items-stretch justify-between gap-6 px-4">
						<div className="flex-1 rounded-2xl bg-white p-6 text-center shadow-lg">
							<div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f3ebff] text-[#6e3bff]">
								<Users className="h-6 w-6" />
							</div>
							<div className="text-2xl font-semibold">1.2M+</div>
							<p className="mt-1 text-sm text-gray-500">Học viên đang học</p>
						</div>
						<div className="flex-1 rounded-2xl bg-white p-6 text-center shadow-lg">
							<div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7ff] text-[#3b6eff]">
								<BookOpen className="h-6 w-6" />
							</div>
							<div className="text-2xl font-semibold">10,000+</div>
							<p className="mt-1 text-sm text-gray-500">Khóa học đa dạng</p>
						</div>
						<div className="flex-1 rounded-2xl bg-white p-6 text-center shadow-lg">
							<div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eafff1] text-[#12a65b]">
								<DollarSign className="h-6 w-6" />
							</div>
							<div className="text-2xl font-semibold">$50M+</div>
							<p className="mt-1 text-sm text-gray-500">Thu nhập giảng viên</p>
						</div>
						<div className="flex-1 rounded-2xl bg-white p-6 text-center shadow-lg">
							<div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fff5ea] text-[#ff9a3a]">
								<Globe className="h-6 w-6" />
							</div>
							<div className="text-2xl font-semibold">180+</div>
							<p className="mt-1 text-sm text-gray-500">Quốc gia</p>
						</div>
					</div>
				</section>

				{/* Steps: Cách thức hoạt động */}
				<section className="mt-20">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="text-3xl font-semibold">Cách thức hoạt động</h2>
						<p className="mt-3 text-gray-500">4 bước đơn giản để bắt đầu hành trình giảng dạy</p>
					</div>

					<div className="mt-12 grid grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
						{/* Step 1 */}
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b3cff] text-white">
								1
							</div>
							<h3 className="font-semibold">Đăng ký</h3>
							<p className="mt-2 text-sm text-gray-500">Điền form đăng ký và cung cấp thông tin chuyên môn của bạn</p>
						</div>

						{/* Step 2 */}
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b3cff] text-white">
								2
							</div>
							<h3 className="font-semibold">Xét duyệt</h3>
							<p className="mt-2 text-sm text-gray-500">Đội ngũ sẽ xem xét hồ sơ trong vòng 2-3 ngày</p>
						</div>

						{/* Step 3 */}
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b3cff] text-white">
								3
							</div>
							<h3 className="font-semibold">Tạo khóa học</h3>
							<p className="mt-2 text-sm text-gray-500">Được duyệt, bắt đầu tạo và tải lên khóa học đầu tiên của bạn</p>
						</div>

						{/* Step 4 */}
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b3cff] text-white">
								4
							</div>
							<h3 className="font-semibold">Kiếm tiền</h3>
							<p className="mt-2 text-sm text-gray-500">Bắt đầu kiếm thu nhập từ học viên đăng ký khóa học</p>
						</div>
					</div>
				</section>

				{/* Benefits section (Lợi ích khi trở thành giảng viên) */}
				<section className="mx-auto mt-16 max-w-6xl px-4">
					<div className="text-center">
						<h2 className="text-3xl font-semibold">Lợi ích khi trở thành giảng viên</h2>
						<p className="mt-3 text-gray-500">Tham gia cộng đồng giảng viên hàng đầu và tận hưởng những lợi ích đặc biệt</p>
					</div>

					<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[
							{ icon: <TrendingUp className="h-6 w-6" />, title: "Thu nhập hấp dẫn", desc: "Nhận tới 70% doanh thu từ mỗi khóa học bán được. Càng nhiều học viên, thu nhập càng cao." },
							{ icon: <Clock className="h-6 w-6" />, title: "Linh hoạt thời gian", desc: "Tự do sắp xếp lịch trình giảng dạy. Làm việc từ xa, bất cứ lúc nào bạn muốn." },
							{ icon: <Globe className="h-6 w-6" />, title: "Tiếp cận toàn cầu", desc: "Chia sẻ kiến thức với hàng triệu học viên trên toàn thế giới." },
							{ icon: <Target className="h-6 w-6" />, title: "Hỗ trợ chuyên nghiệp", desc: "Đội ngũ chuyên gia hỗ trợ 24/7, hướng dẫn tạo nội dung chất lượng và marketing." },
							{ icon: <Zap className="h-6 w-6" />, title: "Công cụ mạnh mẽ", desc: "Nền tảng hiện đại với đầy đủ công cụ quản lý học viên và phân tích dữ liệu." },
							{ icon: <Handshake className="h-6 w-6" />, title: "Cộng đồng năng động", desc: "Kết nối với hàng ngàn giảng viên khác để học hỏi và hợp tác." },
						].map((item) => (
							<div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
								<div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-[#5a2dff]">
									{item.icon}
								</div>
								<h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
								<p className="mt-2 text-sm text-gray-500">{item.desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* Big CTA Banner: Sẵn sàng bắt đầu? */}
				<section className="mx-auto mt-16 w-full max-w-6xl px-4">
					<div className="rounded-4xl bg-gradient-to-r from-[#7a35ff] via-[#8b3dff] to-[#a651ff] px-8 py-16 text-center text-white shadow-lg">
						<h2 className="text-3xl font-semibold">Sẵn sàng bắt đầu?</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
							Tham gia cộng đồng giảng viên EduViet ngay hôm nay và bắt đầu hành trình chia sẻ kiến thức của bạn với thế giới.
						</p>
						<button
							onClick={goToForm} // điều hướng tới trang form mới
							className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#5a2dff] shadow-lg transition hover:brightness-95"
						>
							Đăng ký làm giảng viên ngay
						</button>
					</div>
				</section>

				{/* Simple footer spacing */}
				<div className="mt-24" />
			</div>
		</UserLayout>
	);
}
