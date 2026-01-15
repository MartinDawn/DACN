import React from "react";
import UserLayout from "../user/layout/layout";
import RegisterFormTeacher from "./registerform_teacher";

export default function RegisterTeacherFormPage() {
	return (
		<UserLayout>
			{/* page title */}
			<div className="mx-auto max-w-3xl px-4">
				<h1 className="mb-6 mt-2 text-3xl font-semibold">Đăng ký làm giảng viên</h1>
			</div>

			{/* existing form component */}
			<RegisterFormTeacher />

			{/* spacing */}
			<div className="mt-12" />
		</UserLayout>
	);
}
