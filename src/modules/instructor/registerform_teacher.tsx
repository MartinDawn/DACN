import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useRequestInstructor } from "./hooks/useRequestInstructor";
import { instructorService } from "./services/instructor.service";

export default function RegisterFormTeacher() {
	const { t } = useTranslation();
	const navigate = useNavigate();
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

	const { send } = useRequestInstructor();

	// Check status again to be safe
	useEffect(() => {
		const checkStatus = async () => {
			try {
				const response = await instructorService.getInstructorStatus();
				if (response?.success && response.data) {
					const { status } = response.data;
					const statusStr = String(status || "").toLowerCase();
					if (statusStr === "pending") {
						navigate("/instructor/register-teacher");
					} else if (statusStr === "approved") {
						navigate("/instructor");
					}
				}
			} catch (error) {
				console.error("Error checking status inside form:", error);
			}
		};
		checkStatus();
	}, [navigate]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

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
			toast.success(t("instructor.register.requestSentSuccess"));
				navigate("/instructor/register-teacher");
			} else {
				toast.error(t("instructor.register.requestSentError"));
				setLoading(false);
			}
		} catch (err) {
			toast.error(t("instructor.register.requestAlreadySent"));
			console.error(err);
			setLoading(false);
		}
	};

	return (
		<section id="teacher-form" className="mx-auto mt-12 max-w-3xl px-4">
			<div className="rounded-2xl bg-white p-6 shadow-lg">
				<h3 className="mb-4 text-2xl font-semibold">{t('instructor.register.form.registrationInfo')}</h3>
				<p className="mb-2 text-sm text-gray-500">{t('instructor.register.form.subtitle')}</p>

				

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Personal information */}
					{/* <div>
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
					</div> */}

					{/* Professional information */}
					<div>
						<h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#6a2cff]">
							<span className="inline-block rounded-full bg-[#f3ebff] px-2 py-1 text-sm">🎓</span> {t('instructor.register.form.professionalInfo')}
						</h4>
						<div className="space-y-3">
							{/* expertise -> mapped to API.expertise */}
							<input
								name="expertise"
								value={form.expertise}
								onChange={handleChange}
								placeholder={t('instructor.register.form.expertise')}
								className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/>
							<textarea
								/* experience -> API.experience */
								name="experience"
								value={form.experience}
								onChange={handleChange}
								placeholder={t('instructor.register.form.experience')}
								className="h-28 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#5a2dff] resize-none"
							/>
							{/* certificate -> API.certificate */}
							<input
								name="certificate"
								value={form.certificate}
								onChange={handleChange}
								placeholder={t('instructor.register.form.certificate')}
								className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
							/>
							{/* introduction -> API.introduction */}
							<textarea
								name="introduction"
								value={form.introduction}
								onChange={handleChange}
								placeholder={t('instructor.register.form.introduction')}
								className="h-24 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#5a2dff] resize-none"
							/>
						</div>
					</div>

					{/* Links */}
					<div>
						<h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-[#6a2cff]">
							<span className="inline-block rounded-full bg-[#f3ebff] px-2 py-1 text-sm">🔗</span> {t('instructor.register.form.socialLinks')}
						</h4>
						<input
							name="socialLinks"
							value={form.socialLinks}
							onChange={handleChange}
							placeholder={t('instructor.register.form.socialLinksPlaceholder')}
							className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-[#5a2dff]"
						/>
					</div>


					{/* Actions */}
					<div className="flex items-center justify-between gap-4">
						<button
							type="button"
							onClick={() => window.history.back()}
							className="h-11 rounded-full border border-gray-200 px-6 text-sm font-semibold text-gray-600 hover:bg-gray-100"
						>
							{t('instructor.register.form.cancel')}
						</button>
						<button
							type="submit"
							disabled={loading}
							className="h-11 rounded-full bg-[#6e3bff] px-6 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
						>
							{loading ? t('instructor.register.form.submitting') : t('instructor.register.form.submit')}
						</button>
					</div>
				</form>
			</div>

			{/* FAQ / additional info to mimic screenshot feel */}
			<div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
				<h4 className="mb-4 text-lg font-semibold">{t('instructor.register.faq.title')}</h4>
				<div className="space-y-6 text-sm text-gray-600">
					<div>
						<p className="font-semibold">{t('instructor.register.faq.requirements.question')}</p>
						<p>{t('instructor.register.faq.requirements.answer')}</p>
					</div>
					<div>
						<p className="font-semibold">{t('instructor.register.faq.earnings.question')}</p>
						<p>{t('instructor.register.faq.earnings.answer')}</p>
					</div>
					<div>
						<p className="font-semibold">{t('instructor.register.faq.approval.question')}</p>
						<p>{t('instructor.register.faq.approval.answer')}</p>
					</div>
				</div>
			</div>
		</section>
	);
}