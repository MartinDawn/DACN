import React, { useState } from "react";

export default function RegisterFormTeacher() {
	const [form, setForm] = useState({
		fullName: "",
		email: "",
		phone: "",
		specialty: "",
		experience: "",
		certificates: "",
		motivation: "",
		links: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// replace with real submit logic
		alert("Đơn đăng ký đã được gửi. Cảm ơn bạn!");
	};

	return (
		<section id="teacher-form" className="mx-auto mt-12 max-w-3xl px-4">
			<div className="rounded-2xl bg-white p-6 shadow-lg">
				<h3 className="mb-4 text-2xl font-semibold">Thông tin đăng ký</h3>
				<p className="mb-6 text-sm text-gray-500">Vui lòng cung cấp thông tin chính xác để tăng cơ hội được chấp nhận.</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Personal information */}
					<div>
						<h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#6a2cff]">
							<span className="inline-block rounded-full bg-[#f3ebff] px-2 py-1 text-sm">👤</span> Thông tin cá nhân
						</h4>
						<div className="grid gap-4 sm:grid-cols-2">
							<input
								name="fullName"
								value={form.fullName}
								onChange={handleChange}
								placeholder="Họ và tên"
								className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/>
							<input
								name="email"
								value={form.email}
								onChange={handleChange}
								placeholder="Email"
								type="email"
								className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/>
							<input
								name="phone"
								value={form.phone}
								onChange={handleChange}
								placeholder="Số điện thoại"
								className="col-span-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/>
						</div>
					</div>

					{/* Professional information */}
					<div>
						<h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#6a2cff]">
							<span className="inline-block rounded-full bg-[#f3ebff] px-2 py-1 text-sm">🎓</span> Thông tin chuyên môn
						</h4>
						<div className="space-y-3">
							<input
								name="specialty"
								value={form.specialty}
								onChange={handleChange}
								placeholder="Lĩnh vực chuyên môn (ví dụ: Lập trình Web, Marketing Digital...)"
								className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/>
							<textarea
								name="experience"
								value={form.experience}
								onChange={handleChange}
								placeholder="Kinh nghiệm giảng dạy / làm việc (tối thiểu 100 từ)"
								className="h-28 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#5a2dff] resize-none"
							/>
							<input
								name="certificates"
								value={form.certificates}
								onChange={handleChange}
								placeholder="Bằng cấp & Chứng chỉ (liệt kê)"
								className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/>
						</div>
					</div>

					{/* Motivation */}
					<div>
						<h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#6a2cff]">
							<span className="inline-block rounded-full bg-[#f3ebff] px-2 py-1 text-sm">🎯</span> Động lực và mục tiêu
						</h4>
						<textarea
							name="motivation"
							value={form.motivation}
							onChange={handleChange}
							placeholder="Tại sao bạn muốn trở thành giảng viên? (chia sẻ động lực và mục tiêu)"
							className="h-28 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#5a2dff] resize-none"
						/>
					</div>

					{/* Links */}
					<div>
						<h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#6a2cff]">
							<span className="inline-block rounded-full bg-[#f3ebff] px-2 py-1 text-sm">🔗</span> Liên kết mạng xã hội / Portfolio
						</h4>
						<input
							name="links"
							value={form.links}
							onChange={handleChange}
							placeholder="LinkedIn, Facebook, Website cá nhân, GitHub, Behance..."
							className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
						/>
					</div>

					{/* Important note box */}
					<div className="rounded-xl bg-[#eef6ff] p-4 text-sm text-gray-700">
						<p className="mb-2 font-semibold">Lưu ý quan trọng</p>
						<ul className="space-y-1 list-inside list-disc">
							<li>Đơn đăng ký sẽ được xem xét trong vòng 2-3 ngày làm việc.</li>
							<li>Chúng tôi sẽ liên hệ với bạn qua email đã đăng ký.</li>
							<li>Sau khi được duyệt, bạn sẽ nhận được hướng dẫn chi tiết về cách tạo khóa học.</li>
							<li>Mọi thông tin cá nhân sẽ được bảo mật tuyệt đối.</li>
						</ul>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-between gap-4">
						<button
							type="button"
							onClick={() => window.history.back()}
							className="h-11 rounded-full border border-gray-200 px-6 text-sm font-semibold text-gray-600 hover:bg-gray-100"
						>
							Hủy
						</button>
						<button
							type="submit"
							className="h-11 rounded-full bg-[#6e3bff] px-6 text-sm font-semibold text-white hover:brightness-95"
						>
							Gửi đơn đăng ký
						</button>
					</div>
				</form>
			</div>

			{/* FAQ / additional info to mimic screenshot feel */}
			<div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
				<h4 className="mb-4 text-lg font-semibold">Câu hỏi thường gặp</h4>
				<div className="space-y-6 text-sm text-gray-600">
					<div>
						<p className="font-semibold">Tôi cần những gì để trở thành giảng viên?</p>
						<p>Bạn cần có kiến thức chuyên môn trong lĩnh vực muốn giảng dạy và kỹ năng truyền đạt tốt.</p>
					</div>
					<div>
						<p className="font-semibold">Tôi có thể kiếm được bao nhiêu?</p>
						<p>Giảng viên nhận 70% doanh thu từ mỗi khóa học. Thu nhập còn phụ thuộc chất lượng và số lượng học viên.</p>
					</div>
					<div>
						<p className="font-semibold">Mất bao lâu để được duyệt?</p>
						<p>Thường từ 2-3 ngày làm việc. Chúng tôi có thể liên hệ để yêu cầu thêm thông tin.</p>
					</div>
				</div>
			</div>
		</section>
	);
}