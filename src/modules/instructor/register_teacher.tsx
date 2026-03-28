import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import UserLayout from "../user/layout/layout";
import { instructorService } from "./services/instructor.service";
// import { toast } from "react-hot-toast"; //thông báo hiển thị popup trên góc phải màn hình
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
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [checkLoading, setCheckLoading] = useState(true);
	const [isPending, setIsPending] = useState(false);

	useEffect(() => {
		const checkStatus = async () => {
			try {
				const response = await instructorService.getInstructorStatus();
				if (response?.success && response.data) {
					const { status } = response.data;
					const statusStr = String(status || "").toLowerCase();
					if (statusStr === "pending") {
						setIsPending(true);
					} else if (statusStr === "approved") {
						navigate("/instructor");
					}
					// Nếu Rejected hoặc None thì ở lại trang này
				}
			} catch (error) {
				console.error("Error checking instructor status:", error);
			} finally {
				setCheckLoading(false);
			}
		};
		checkStatus();
	}, [navigate]);

	const goToForm = () => {
		navigate("/instructor/register-teacher/form");
	};

	if (checkLoading) {
		return (
			<UserLayout>
				<div className="flex min-h-screen items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5a2dff] border-t-transparent"></div>
				</div>
			</UserLayout>
		);
	}

	if (isPending) {
		return (
			<UserLayout>
				<div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
					<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-500">
						<Clock className="h-12 w-12" />
					</div>
					<h1 className="mb-4 text-3xl font-bold text-gray-900">{t('registerTeacher.pending.title')}</h1>
					<p className="mb-8 max-w-lg text-lg text-gray-600">
						{t('registerTeacher.pending.message')}
					</p>
					<Link
						to="/user/home"
						className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
					>
						<ArrowLeft className="h-4 w-4" />
						{t('registerTeacher.pending.backToHome')}
					</Link>
				</div>
			</UserLayout>
		);
	}

	return (
		<UserLayout>
			<div className="space-y-8">
				<Link
					to="/user/home"
					className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
				>
					<ArrowLeft className="h-4 w-4" />
					{t('registerTeacher.pending.backToHome')}
				</Link>
				{/* Hero */}
				<section className="relative overflow-hidden rounded-b-2xl">
					<div className="bg-gradient-to-r from-[#8b3cff] via-[#6e3bff] to-[#1768ff] py-24 text-center text-white">
						<div className="mx-auto max-w-4xl px-4">
							<span className="mb-4 inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
								{t('registerTeacher.hero.badge')}
							</span>
							<h1 className="mt-6 text-4xl font-semibold leading-tight">
								{t('registerTeacher.hero.title')}
							</h1>
							<p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
								{t('registerTeacher.hero.subtitle')}
							</p>

							{/* CTA */}
							<div className="mx-auto mt-8 flex max-w-md items-center gap-4 justify-center">
								<button
									onClick={goToForm}
									className="flex items-center justify-center rounded-full bg-white/95 px-6 py-3 text-sm font-semibold text-[#5a2dff] shadow hover:brightness-95"
								>
									{t('registerTeacher.hero.registerNow')}
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
							<div className="text-2xl font-semibold">{t('registerTeacher.stats.students')}</div>
							<p className="mt-1 text-sm text-gray-500">{t('registerTeacher.stats.studentsLabel')}</p>
						</div>
						<div className="flex-1 rounded-2xl bg-white p-6 text-center shadow-lg">
							<div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eef7ff] text-[#3b6eff]">
								<BookOpen className="h-6 w-6" />
							</div>
							<div className="text-2xl font-semibold">{t('registerTeacher.stats.courses')}</div>
							<p className="mt-1 text-sm text-gray-500">{t('registerTeacher.stats.coursesLabel')}</p>
						</div>
						<div className="flex-1 rounded-2xl bg-white p-6 text-center shadow-lg">
							<div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eafff1] text-[#12a65b]">
								<DollarSign className="h-6 w-6" />
							</div>
							<div className="text-2xl font-semibold">{t('registerTeacher.stats.revenue')}</div>
							<p className="mt-1 text-sm text-gray-500">{t('registerTeacher.stats.revenueLabel')}</p>
						</div>
						<div className="flex-1 rounded-2xl bg-white p-6 text-center shadow-lg">
							<div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fff5ea] text-[#ff9a3a]">
								<Globe className="h-6 w-6" />
							</div>
							<div className="text-2xl font-semibold">{t('registerTeacher.stats.countries')}</div>
							<p className="mt-1 text-sm text-gray-500">{t('registerTeacher.stats.countriesLabel')}</p>
						</div>
					</div>
				</section>

				{/* Steps: Cách thức hoạt động */}
				<section className="mt-20">
					<div className="mx-auto max-w-3xl text-center">
						<h2 className="text-3xl font-semibold">{t('registerTeacher.howItWorks.title')}</h2>
						<p className="mt-3 text-gray-500">{t('registerTeacher.howItWorks.subtitle')}</p>
					</div>

					<div className="mt-12 grid grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
						{/* Step 1 */}
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b3cff] text-white">
								1
							</div>
							<h3 className="font-semibold">{t('registerTeacher.howItWorks.steps.register.title')}</h3>
							<p className="mt-2 text-sm text-gray-500">{t('registerTeacher.howItWorks.steps.register.description')}</p>
						</div>

						{/* Step 2 */}
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b3cff] text-white">
								2
							</div>
							<h3 className="font-semibold">{t('registerTeacher.howItWorks.steps.review.title')}</h3>
							<p className="mt-2 text-sm text-gray-500">{t('registerTeacher.howItWorks.steps.review.description')}</p>
						</div>

						{/* Step 3 */}
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b3cff] text-white">
								3
							</div>
							<h3 className="font-semibold">{t('registerTeacher.howItWorks.steps.create.title')}</h3>
							<p className="mt-2 text-sm text-gray-500">{t('registerTeacher.howItWorks.steps.create.description')}</p>
						</div>

						{/* Step 4 */}
						<div className="text-center">
							<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#8b3cff] text-white">
								4
							</div>
							<h3 className="font-semibold">{t('registerTeacher.howItWorks.steps.earn.title')}</h3>
							<p className="mt-2 text-sm text-gray-500">{t('registerTeacher.howItWorks.steps.earn.description')}</p>
						</div>
					</div>
				</section>

				{/* Benefits section (Lợi ích khi trở thành giảng viên) */}
				<section className="mx-auto mt-16 max-w-6xl px-4">
					<div className="text-center">
						<h2 className="text-3xl font-semibold">{t('registerTeacher.benefits.title')}</h2>
						<p className="mt-3 text-gray-500">{t('registerTeacher.benefits.subtitle')}</p>
					</div>

					<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[
							{
								icon: <TrendingUp className="h-6 w-6" />,
								title: t('registerTeacher.benefits.items.income.title'),
								desc: t('registerTeacher.benefits.items.income.description')
							},
							{
								icon: <Clock className="h-6 w-6" />,
								title: t('registerTeacher.benefits.items.flexible.title'),
								desc: t('registerTeacher.benefits.items.flexible.description')
							},
							{
								icon: <Globe className="h-6 w-6" />,
								title: t('registerTeacher.benefits.items.global.title'),
								desc: t('registerTeacher.benefits.items.global.description')
							},
							{
								icon: <Target className="h-6 w-6" />,
								title: t('registerTeacher.benefits.items.support.title'),
								desc: t('registerTeacher.benefits.items.support.description')
							},
							{
								icon: <Zap className="h-6 w-6" />,
								title: t('registerTeacher.benefits.items.tools.title'),
								desc: t('registerTeacher.benefits.items.tools.description')
							},
							{
								icon: <Handshake className="h-6 w-6" />,
								title: t('registerTeacher.benefits.items.community.title'),
								desc: t('registerTeacher.benefits.items.community.description')
							},
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
						<h2 className="text-3xl font-semibold">{t('registerTeacher.cta.title')}</h2>
						<p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
							{t('registerTeacher.cta.subtitle')}
						</p>
						<button
							onClick={goToForm}
							className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#5a2dff] shadow-lg transition hover:brightness-95"
						>
							{t('registerTeacher.cta.button')}
						</button>
					</div>
				</section>

				{/* Simple footer spacing */}
				<div className="mt-24" />
			</div>
		</UserLayout>
	);
}
