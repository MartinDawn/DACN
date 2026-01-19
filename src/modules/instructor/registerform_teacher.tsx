import React, { useState } from "react";
import { useRequestInstructor } from "./hooks/useRequestInstructor";

export default function RegisterFormTeacher() {
	const [form, setForm] = useState({
		fullName: "",
		email: "",
		expertise: "",
		experience: "",
		certificate: "",
		introduction: "",
		socialLinks: "",
	});
	const [lang, setLang] = useState<"vi" | "en">("vi");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { send } = useRequestInstructor();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		setError(null);

		const payload = {
			experience: form.experience,
			expertise: form.expertise,
			certificate: form.certificate,
			introduction: form.introduction,
			socialLinks: form.socialLinks,
		};

		try {
			const res = await send(payload, lang);
			if (res && res.success) {
				// Hiển thị thông báo tiếng Việt cố định thay vì phụ thuộc vào res.message (có thể là tiếng Anh)
				setMessage("Yêu cầu đã được gửi thành công.");
				// optionally reset form:
				// setForm({ fullName: "", email: "", expertise: "", experience: "", certificate: "", introduction: "", socialLinks: "" });
			} else {
				// Hiển thị lỗi chung bằng tiếng Việt
				setError("Có lỗi khi gửi yêu cầu. Vui lòng thử lại.");
			}
		} catch (err) {
			setError("Lỗi kết nối. Vui lòng thử lại.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<section id="teacher-form" className="mx-auto mt-12 max-w-3xl px-4">
			<div className="rounded-2xl bg-white p-6 shadow-lg">
				<h3 className="mb-4 text-2xl font-semibold">Thông tin đăng ký</h3>
				<p className="mb-2 text-sm text-gray-500">Vui lòng cung cấp thông tin chính xác để tăng cơ hội được chấp nhận.</p>

				

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
							{/* <input
								name="phone"
								value={form.phone}
								onChange={handleChange}
								placeholder="Số điện thoại"
								className="col-span-2 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/> */}
						</div>
					</div>

					{/* Professional information */}
					<div>
						<h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#6a2cff]">
							<span className="inline-block rounded-full bg-[#f3ebff] px-2 py-1 text-sm">🎓</span> Thông tin chuyên môn
						</h4>
						<div className="space-y-3">
							{/* expertise -> mapped to API.expertise */}
							<input
								name="expertise"
								value={form.expertise}
								onChange={handleChange}
								placeholder="Lĩnh vực chuyên môn / expertise (ví dụ: Lập trình Web, Marketing...)"
								className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/>
							<textarea
								/* experience -> API.experience */
								name="experience"
								value={form.experience}
								onChange={handleChange}
								placeholder="Kinh nghiệm giảng dạy / làm việc (tối thiểu 100 từ)"
								className="h-28 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#5a2dff] resize-none"
							/>
							{/* certificate -> API.certificate */}
							<input
								name="certificate"
								value={form.certificate}
								onChange={handleChange}
								placeholder="Bằng cấp & Chứng chỉ (liệt kê)"
								className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/>
							{/* introduction -> API.introduction */}
							<textarea
								name="introduction"
								value={form.introduction}
								onChange={handleChange}
								placeholder="Giới thiệu ngắn về bản thân (mục tiêu, phong cách giảng dạy)..."
								className="h-24 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#5a2dff] resize-none"
							/>
						</div>
					</div>

					{/* Links */}
					<div>
						<h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#6a2cff]">
							<span className="inline-block rounded-full bg-[#f3ebff] px-2 py-1 text-sm">🔗</span> Liên kết mạng xã hội / Portfolio
						</h4>
						<input
							name="socialLinks"
							value={form.socialLinks}
							onChange={handleChange}
							placeholder="LinkedIn, Facebook, Website cá nhân, GitHub, Behance..."
							className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
						/>
					</div>

					{/* status messages */}
					{message && <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</div>}
					{error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

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
							disabled={loading}
							className="h-11 rounded-full bg-[#6e3bff] px-6 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
						>
							{loading ? "Đang gửi..." : "Gửi đơn đăng ký"}
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