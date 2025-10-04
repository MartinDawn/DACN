import React from "react";
import { Link } from "react-router-dom";
import {
	ArrowLeftIcon,
	BookmarkIcon,
	CheckBadgeIcon,
	ClockIcon,
	DocumentArrowDownIcon,
	HeartIcon,
	LanguageIcon,
	PlayCircleIcon,
	ShareIcon,
	UserGroupIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, StarIcon } from "@heroicons/react/20/solid";
import UserLayout from "./layout/layout";

const course = {
	title: "Complete React Developer Course 2024",
	description: "Học React từ cơ bản đến nâng cao. Xây dựng ứng dụng web hiện đại với React, Redux, và nhiều công nghệ khác.",
	rating: 4.8,
	ratingCount: "12,547",
	students: "45,821 học viên",
	duration: "42 giờ",
	lastUpdated: "Cập nhật 01/2024",
	language: "Tiếng Việt",
	subtitles: ["Tiếng Việt"],
	image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
	categories: ["Lập trình", "Bán chạy", "Intermediate"],
	price: "599,000đ",
	originalPrice: "1,199,000đ",
	discountLabel: "Giảm 50%",
	instructor: {
		name: "Nguyễn Văn A",
		role: "Giảng viên",
		avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80",
	},
	learnWhat: ["Video chất lượng HD", "Chứng chỉ hoàn thành", "Truy cập trọn đời", "Hỗ trợ trực tuyến"],
	stats: [
		{ value: "156", label: "Bài học" },
		{ value: "42 giờ", label: "Thời lượng" },
		{ value: "Intermediate", label: "Cấp độ" },
		{ value: "Trọn đời", label: "Truy cập" },
	],
	benefits: [
		{ icon: PlayCircleIcon, text: "42 giờ video theo yêu cầu" },
		{ icon: DocumentArrowDownIcon, text: "Tài liệu có thể tải xuống" },
		{ icon: CheckBadgeIcon, text: "Chứng chỉ hoàn thành" },
		{ icon: LanguageIcon, text: "Truy cập trọn đời" },
	],
	curriculum: [
		{
			title: "Giới thiệu React",
			lessons: "12 bài học",
			duration: "1 giờ 30 phút",
			topics: ["React là gì?", "Cài đặt môi trường", "Tạo ứng dụng React đầu tiên"],
		},
		{
			title: "Quản lý trạng thái",
			lessons: "18 bài học",
			duration: "2 giờ 10 phút",
			topics: ["Hooks cơ bản", "Context API", "Giới thiệu Redux"],
		},
		{
			title: "Dự án thực tế",
			lessons: "24 bài học",
			duration: "3 giờ 45 phút",
			topics: ["Phân tích yêu cầu", "Xây dựng UI", "Triển khai và tối ưu"],
		},
	],
};

const tabs = [
	{ id: "overview", label: "Tổng quan" },
	{ id: "curriculum", label: "Chương trình học" },
	{ id: "reviews", label: "Đánh giá" },
] as const;

const CourseDetail: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState<(typeof tabs)[number]["id"]>("overview");

	return (
		<UserLayout>
			<div className="space-y-8">
				<Link
					to="/user/home"
					className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
				>
					<ArrowLeftIcon className="h-4 w-4" />
					Quay lại khóa học
				</Link>

				<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr),360px]">
					<section className="space-y-10">
						<header className="space-y-6 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
							<div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#5a2dff]">
								{course.categories.map((tag) => (
									<span key={tag} className="rounded-full bg-[#efe7ff] px-3 py-1 text-[#5a2dff]">
										{tag}
									</span>
								))}
							</div>
							<h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>
							<p className="text-lg text-gray-600">{course.description}</p>

							<div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
								<div className="flex items-center gap-1 text-yellow-500">
									<StarIcon className="h-5 w-5" />
									<span className="font-semibold text-gray-900">{course.rating}</span>
									<span>({course.ratingCount} đánh giá)</span>
								</div>
								<div className="flex items-center gap-2">
									<UserGroupIcon className="h-5 w-5" />
									{course.students}
								</div>
								<div className="flex items-center gap-2">
									<ClockIcon className="h-5 w-5" />
									{course.duration}
								</div>
								<span>{course.lastUpdated}</span>
								<span>{course.language}</span>
							</div>

							<div className="flex items-center gap-3">
								<img
									src={course.instructor.avatar}
									alt={course.instructor.name}
									className="h-14 w-14 rounded-full object-cover"
								/>
								<div>
									<p className="text-sm text-gray-500">{course.instructor.role}</p>
									<p className="text-base font-semibold text-gray-900">{course.instructor.name}</p>
								</div>
							</div>

							<div className="overflow-hidden rounded-[28px]">
								<img src={course.image} alt={course.title} className="h-64 w-full object-cover" />
							</div>
						</header>

						<nav className="flex flex-wrap gap-3 border-b border-gray-200 pb-2">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
										activeTab === tab.id
											? "bg-[#05001a] text-white shadow-[0_12px_30px_rgba(5,0,26,0.25)]"
											: "text-gray-600 hover:bg-[#f3f4fb]"
									}`}
								>
									{tab.label}
								</button>
							))}
						</nav>

						{activeTab === "overview" && (
							<div className="space-y-8">
								<div className="rounded-[28px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
									<h2 className="text-xl font-bold text-gray-900">Bạn sẽ học được gì</h2>
									<div className="mt-6 grid gap-4 sm:grid-cols-2">
										{course.learnWhat.map((item) => (
											<div key={item} className="flex items-start gap-3 rounded-2xl bg-[#f8f8ff] p-4">
												<CheckCircleIcon className="h-5 w-5 text-[#5a2dff]" />
												<p className="text-sm font-semibold text-gray-700">{item}</p>
											</div>
										))}
									</div>
								</div>

								<div className="rounded-[28px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
									<h2 className="text-xl font-bold text-gray-900">Mô tả khóa học</h2>
									<p className="mt-4 text-base leading-relaxed text-gray-600">
										Khóa học giúp bạn xây dựng ứng dụng React hiện đại với Redux, React Router, và các kỹ thuật tối ưu hiệu năng.
										Bạn sẽ thực hành qua các dự án thực tế để nắm vững quy trình phát triển sản phẩm từ ý tưởng đến triển khai.
									</p>
									<div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
										{course.stats.map((stat) => (
											<div key={stat.label} className="rounded-2xl bg-[#f7f7fb] p-4 text-center">
												<p className="text-2xl font-bold text-[#5a2dff]">{stat.value}</p>
												<p className="text-sm font-semibold text-gray-500">{stat.label}</p>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{activeTab === "curriculum" && (
							<div className="space-y-6">
								{course.curriculum.map((section) => (
									<div key={section.title} className="rounded-[28px] border border-gray-200 bg-white p-6">
										<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
											<div>
												<h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
												<p className="text-sm text-gray-500">
													{section.lessons} • {section.duration}
												</p>
											</div>
										</div>
										<ul className="mt-4 space-y-3 text-sm text-gray-600">
											{section.topics.map((topic) => (
												<li key={topic} className="flex items-start gap-2">
													<CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-[#5a2dff]" />
													<span>{topic}</span>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						)}

						{activeTab === "reviews" && (
							<div className="rounded-[28px] border border-dashed border-gray-200 bg-white p-12 text-center text-sm font-semibold text-gray-500">
								Chưa có đánh giá nào được hiển thị. Hãy là người đầu tiên để lại đánh giá cho khóa học này.
							</div>
						)}
					</section>

					<aside className="space-y-6 rounded-[32px] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)] lg:sticky lg:top-28">
						<div className="space-y-4">
							<div className="flex items-baseline gap-3">
								<p className="text-3xl font-bold text-gray-900">{course.price}</p>
								<p className="text-sm text-gray-400 line-through">{course.originalPrice}</p>
							</div>
							<span className="inline-flex items-center rounded-full bg-[#ffecef] px-3 py-1 text-xs font-semibold uppercase text-[#ff3d71]">
								{course.discountLabel}
							</span>
							<button className="w-full rounded-full bg-[#5a2dff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3c1cd6]">
								Đăng ký khóa học
							</button>
							<button className="w-full rounded-full border border-[#e4e6f1] px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-[#d6d7e4] hover:bg-[#f7f7fb]">
								Thêm vào giỏ hàng
							</button>
							<div className="flex items-center justify-between text-sm text-gray-500">
								<button className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 transition hover:border-[#5a2dff] hover:text-[#5a2dff]">
									<HeartIcon className="h-4 w-4" />
									Yêu thích
								</button>
								<button className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 transition hover:border-[#5a2dff] hover:text-[#5a2dff]">
									<ShareIcon className="h-4 w-4" />
									Chia sẻ
								</button>
								<button className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 transition hover:border-[#5a2dff] hover:text-[#5a2dff]">
									<BookmarkIcon className="h-4 w-4" />
									Lưu lại
								</button>
							</div>
						</div>

						<div className="space-y-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Khóa học này bao gồm</p>
							<ul className="space-y-3 text-sm text-gray-600">
								{course.benefits.map(({ icon: Icon, text }) => (
									<li key={text} className="flex items-center gap-3 rounded-2xl bg-[#f7f7fb] px-4 py-3">
										<Icon className="h-5 w-5 text-[#5a2dff]" />
										<span className="font-semibold">{text}</span>
									</li>
								))}
							</ul>
						</div>

						<div className="rounded-2xl bg-[#f6f7ff] p-4 text-sm text-gray-600">
							<p>Truy cập trọn đời vào tất cả nội dung, bao gồm các bản cập nhật mới nhất.</p>
							<p className="mt-2 font-semibold text-gray-900">Hỗ trợ hoàn tiền trong 30 ngày.</p>
						</div>
					</aside>
				</div>
			</div>
		</UserLayout>
	);
};

export default CourseDetail;
