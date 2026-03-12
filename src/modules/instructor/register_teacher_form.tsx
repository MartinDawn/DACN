import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../user/layout/layout";
import RegisterFormTeacher from "./registerform_teacher";
import { instructorService } from "./services/instructor.service";

export default function RegisterTeacherFormPage() {
	const navigate = useNavigate();
	const [checkLoading, setCheckLoading] = useState(true);

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
					// Only allow if Rejected or None
				}
			} catch (error) {
				console.error("Error checking status:", error);
			} finally {
				setCheckLoading(false);
			}
		};
		checkStatus();
	}, [navigate]);

	if (checkLoading) {
		return (
			<UserLayout>
				<div className="flex min-h-screen items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5a2dff] border-t-transparent"></div>
				</div>
			</UserLayout>
		);
	}

	return (
		<UserLayout>
			
			<RegisterFormTeacher />

			{/* spacing */}
			<div className="mt-12" />
		</UserLayout>
	);
}
