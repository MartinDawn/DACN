// src/components/MyInfo.tsx

import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, CameraIcon } from "@heroicons/react/24/outline";
import { FaGithub, FaLinkedinIn, FaTwitter, FaInstagram, FaFacebookF } from "react-icons/fa";
import AvatarLayout from "./layout/layout";
import PostCard from "./components/post_card";
// Thêm Toaster để hiển thị thông báo
import { Toaster } from "react-hot-toast";

// Import hooks và helpers từ các file bạn đã tạo
import {
  useUserProfileData,
  useUpdateProfile,
  formatBirthDateToInput,
} from "./hooks/useUserProfile.ts"; 
import { type UserProfile, type UserProfileStats } from "./models/userProfile.model"; // <-- Cập nhật đường dẫn này

const defaultSkills = ["React", "Node.js", "Python", "JavaScript", "TypeScript", "MongoDB"];

type SocialLink = {
  label: string;
  placeholder: string;
  value: string;
  Icon: React.ComponentType<{ className?: string }>;
};

type PersonalInfo = {
  fullName: string;
  jobTitle: string;
  phone: string;
  address: string;
  email: string;
  company: string;
  birthday: string;
  gender: string;
  experience: string;
};

const socialLinkDefaults: SocialLink[] = [
  { label: "GitHub", placeholder: "https://github.com/username", value: "", Icon: FaGithub },
  { label: "LinkedIn", placeholder: "https://linkedin.com/in/username", value: "", Icon: FaLinkedinIn },
  { label: "Twitter", placeholder: "https://twitter.com/username", value: "", Icon: FaTwitter },
  { label: "Instagram", placeholder: "https://instagram.com/username", value: "", Icon: FaInstagram },
  { label: "Facebook", placeholder: "https://facebook.com/username", value: "", Icon: FaFacebookF },
];

const personalInfoConfig: Record<"left" | "right", Array<{ key: keyof PersonalInfo; label: string }>> = {
  left: [
    { key: "fullName", label: "Họ và tên" },
    { key: "jobTitle", label: "Vị trí công việc" },
    { key: "phone", label: "Số điện thoại" },
    { key: "address", label: "Địa chỉ" },
  ],
  right: [
    { key: "email", label: "Email" },
    { key: "company", label: "Công ty" },
    { key: "birthday", label: "Ngày sinh" },
    { key: "gender", label: "Giới tính" },
    { key: "experience", label: "Kinh nghiệm" },
  ],
};

// Giá trị khởi tạo tạm thời khi chờ API
const initialPersonalInfo: PersonalInfo = {
  fullName: "Đang tải...",
  jobTitle: "Đang tải...",
  phone: "Đang tải...",
  address: "Đang tải...",
  email: "Đang tải...",
  company: "Đang tải...",
  birthday: "Đang tải...",
  gender: "Đang tải...",
  experience: "Đang tải...",
};

const initialAbout = "Đang tải...";
const initialWebsite = "Đang tải..."; 

type ProfileSnapshot = {
  personalInfo: PersonalInfo;
  about: string;
  website: string;
  socialLinks: SocialLink[];
  skills: string[];
  avatarPreview: string | null;
};

const MyInfo: React.FC = () => {
  // --- STATE TỪ COMPONENT ---
  const [isEditing, setIsEditing] = React.useState(false);
  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo>(initialPersonalInfo);
  const [about, setAbout] = React.useState(initialAbout);
  const [website, setWebsite] = React.useState(initialWebsite); // Giữ nguyên state này
  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>(socialLinkDefaults); // Giữ nguyên state này
  const [userSkills, setUserSkills] = React.useState<string[]>(defaultSkills); // Giữ nguyên state này
  const [newSkill, setNewSkill] = React.useState("");
  const [skillError, setSkillError] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const profileSnapshotRef = React.useRef<ProfileSnapshot | null>(null);

  // --- STATE TỪ API (QUA HOOK) ---
  const { profileData, isLoading, fetchProfile } = useUserProfileData();
  const { saveProfile, isSaving } = useUpdateProfile();

  // State riêng cho các thông tin hiển thị ở sidebar (không bị chỉnh sửa trực tiếp)
  const [username, setUsername] = React.useState("...");
  const [stats, setStats] = React.useState<UserProfileStats | null>(null);
  const [memberSinceYear, setMemberSinceYear] = React.useState<number | null>(null);
  const [location, setLocation] = React.useState("...");

  // --- EFFECT ĐỂ LẤY DỮ LIỆU TỪ API KHI MOUNT ---
  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // --- EFFECT ĐỂ CẬP NHẬT STATE KHI DỮ LIỆU API VỀ ---
  React.useEffect(() => {
    if (profileData) {
      // Map dữ liệu API vào state của component
      setPersonalInfo({
        fullName: profileData.fullName || "Chưa cập nhật",
        jobTitle: profileData.jobPosition || "Chưa cập nhật",
        phone: profileData.phoneNumber || "Chưa cập nhật",
        address: profileData.location || "Chưa cập nhật",
        email: profileData.email || "Chưa cập nhật",
        company: profileData.organization || "Chưa cập nhật",
        birthday: formatBirthDateToInput(profileData.birthDate),
        gender: profileData.gender || "Chưa cập nhật",
        experience: profileData.experience || "Chưa cập nhật",
      });
      setAbout(profileData.description || "Chưa cập nhật");
      setAvatarPreview(profileData.avatarUrl || null);

      // Cập nhật state sidebar
      setUsername(profileData.username);
      setStats(profileData.stats);
      setMemberSinceYear(profileData.memberSinceYear);
      setLocation(profileData.location || "Chưa cập nhật");

      // Các trường này không có trong API, giữ giá trị default
      // setWebsite(profileData.website || initialWebsite);
      // setUserSkills(profileData.skills || defaultSkills);
      // setSocialLinks(profileData.socialLinks || socialLinkDefaults);
    }
  }, [profileData]);

  // --- LOGIC CŨ (GIỮ NGUYÊN) ---
  const handlePersonalInfoChange = (key: keyof PersonalInfo, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [key]: value }));
  };

  const handleSocialChange = (index: number, value: string) => {
    setSocialLinks((links) => links.map((link, idx) => (idx === index ? { ...link, value } : link)));
  };
  const handleAddSkill = () => {
    const candidate = newSkill.trim();
    if (!candidate) {
      setSkillError("Vui lòng nhập kỹ năng hợp lệ.");
      return;
    }
    if (userSkills.some((skill) => skill.toLowerCase() === candidate.toLowerCase())) {
      setSkillError("Kỹ năng đã tồn tại.");
      return;
    }
    setUserSkills((prev) => [...prev, candidate]);
    setNewSkill("");
    setSkillError(null);
  };
  const handleRemoveSkill = (skill: string) => {
    setUserSkills((prev) => prev.filter((item) => item !== skill));
  };
  const handleCancelEdit = () => {
    if (isSaving) return;
    const snapshot = profileSnapshotRef.current;
    if (snapshot) {
      setPersonalInfo(snapshot.personalInfo);
      setAbout(snapshot.about);
      setWebsite(snapshot.website);
      setSocialLinks(snapshot.socialLinks);
      setUserSkills(snapshot.skills);
      if (avatarPreview?.startsWith("blob:") && avatarPreview !== snapshot.avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(snapshot.avatarPreview);
    }
    setAvatarFile(null);
    setNewSkill("");
    setSkillError(null);
    profileSnapshotRef.current = null;
    setIsEditing(false);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setAvatarFile(file);
    setAvatarPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  // --- LOGIC MỚI (ĐÃ THAY ĐỔI) ---

  const handleToggleEdit = async () => {
    if (isSaving) return;
    if (!isEditing) {
      // Bật chế độ chỉnh sửa
      profileSnapshotRef.current = {
        personalInfo: { ...personalInfo },
        about,
        website,
        socialLinks: socialLinks.map((link) => ({ ...link })),
        skills: [...userSkills],
        avatarPreview,
      };
      setIsEditing(true);
      return;
    }

    // Tắt chế độ chỉnh sửa (LƯU)
    // Gom lại state hiện tại để gửi đi
    const currentState = {
      personalInfo,
      about,
      website,
      // socialLinks, // API của bạn chưa có, nên hook không xử lý
      skills: userSkills, // API của bạn chưa có, nên hook không xử lý
    };

    // Gọi hook để lưu
    const result = await saveProfile(currentState, avatarFile);

    if (result.success) {
      // Cập nhật state với dữ liệu mới từ server (nếu có)
      if (result.newProfile) {
        // Map dữ liệu API trả về (UserProfile) sang state (PersonalInfo)
        setPersonalInfo({
          ...personalInfo, // Giữ lại email (không đổi)
          fullName: result.newProfile.fullName,
          jobTitle: result.newProfile.jobPosition,
          phone: result.newProfile.phoneNumber,
          address: result.newProfile.location,
          company: result.newProfile.organization,
          birthday: formatBirthDateToInput(result.newProfile.birthDate),
          gender: result.newProfile.gender,
          experience: result.newProfile.experience,
        });
        setAbout(result.newProfile.description);
        // Cập nhật luôn sidebar
        setLocation(result.newProfile.location);
      }
      // Cập nhật avatar
      if (result.newAvatarUrl) {
        setAvatarPreview(result.newAvatarUrl);
      } else if (avatarFile && avatarPreview?.startsWith("blob:")) {
        // Nếu upload thất bại nhưng vẫn lưu, quay lại avatar cũ
        setAvatarPreview(profileSnapshotRef.current?.avatarPreview || null);
      }

      // Reset
      profileSnapshotRef.current = null;
      setIsEditing(false);
      setAvatarFile(null);
      setNewSkill("");
      setSkillError(null);
    }
    // Lỗi đã được xử lý bằng toast trong hook
  };

  React.useEffect(
    () => () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview]
  );

  // Hiển thị loading
  if (isLoading) {
    return (
      <AvatarLayout>
        <div className="flex h-96 items-center justify-center">
          <p className="text-lg font-semibold text-[#5a2dff]">Đang tải thông tin...</p>
        </div>
      </AvatarLayout>
    );
  }

  return (
    <AvatarLayout>
      {/* Thêm Toaster để nhận thông báo từ hook */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          to="/user/home"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#efe7ff]">
            <ArrowLeftIcon className="h-4 w-4" />
          </span>
          Quay lại trang chủ
        </Link>
        <div className="hidden items-center gap-2 text-sm font-medium text-gray-500 md:flex">
          {["Thông tin", "Thành tích", "Bảo mật", "Thông báo", "Quyền riêng tư", "Thanh toán"].map(
            (label, index) => (
              <button
                key={label}
                type="button"
                className={`rounded-full px-4 py-2 transition ${
                  index === 0 ? "bg-white text-[#5a2dff] shadow" : "hover:bg-white hover:text-[#5a2dff]"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[360px,minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="rounded-3xl bg-white p-6 text-center shadow-md">
            <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-3xl bg-[#5a2dff]/10">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-[#5a2dff]">
                  {personalInfo.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                type="button"
                disabled={!isEditing}
                onClick={() => isEditing && fileInputRef.current?.click()}
                className={`absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow transition ${
                  isEditing ? "bg-[#5a2dff] hover:bg-[#4a21eb]" : "cursor-not-allowed bg-gray-300"
                }`}
                aria-label="Tải ảnh đại diện"
              >
                <CameraIcon className="h-4 w-4" />
              </button>
            </div>
            {/* Dữ liệu từ API */}
            <h2 className="text-lg font-bold text-gray-900">{username}</h2>
            {/* Dữ liệu từ state (đã được API map) */}
            <p className="text-sm font-medium text-[#5a2dff]">{personalInfo.jobTitle}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {personalInfo.company}
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                {/* Dữ liệu từ API */}
                <span>📍</span> {location}
              </div>
              <div className="flex items-center justify-center gap-2">
                {/* Dữ liệu từ API */}
                <span>🗓</span> Thành viên từ {memberSinceYear || "..."}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Thống kê học tập
            </h3>
            {/* Dữ liệu từ API */}
            {stats ? (
              <>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>Tiến độ hoàn thành</span>
                    <span>{stats.completionProgress}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#5a2dff]"
                      style={{ width: `${stats.completionProgress}%` }}
                    />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-center text-sm font-semibold text-gray-700">
                  <div className="rounded-2xl bg-[#5a2dff]/5 p-3">
                    <p className="text-2xl font-bold text-[#5a2dff]">{stats.totalHours}</p>
                    <p className="text-xs uppercase text-gray-500">Giờ học</p>
                  </div>
                  <div className="rounded-2xl bg-[#5a2dff]/5 p-3">
                    <p className="text-2xl font-bold text-[#5a2dff]">{stats.totalCertificates}</p>
                    <p className="text-xs uppercase text-gray-500">Chứng chỉ</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
                    <span>🔥 Streak hiện tại</span>
                    <span className="font-semibold text-gray-900">{stats.currentStreak} ngày</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
                    <span>⭐ Đánh giá TB</span>
                    <span className="font-semibold text-gray-900">
                      {stats.averageGivenRating.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-gray-500">Chưa có thống kê.</p>
            )}
            <Link
              to="/user/mycourses"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5a2dff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a21eb]"
            >
              Xem khóa học của tôi
            </Link>
          </section>

          <section className="space-y-3">
            <PostCard icon="📄" title="Tải chứng chỉ" description="Xuất chứng chỉ đã hoàn thành" asButton />
            <PostCard icon="📊" title="Báo cáo tiến độ" description="Xem tổng quan học tập" asButton />
            <PostCard icon="⚙️" title="Cài đặt nâng cao" description="Quản lý tài khoản" asButton />
          </section>
        </aside>

        <section className="space-y-6">
          <header className="rounded-3xl border border-[#5a2dff]/10 bg-gradient-to-r from-[#efeaff] to-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Cập nhật hồ sơ để nhận gợi ý khóa học phù hợp và kết nối cộng đồng học viên.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleEdit}
                disabled={isSaving} // Lấy từ hook
                className={`inline-flex items-center gap-2 rounded-full border border-[#5a2dff] px-5 py-2 text-sm font-semibold transition ${
                  isEditing
                    ? "bg-[#5a2dff] text-white hover:bg-[#4a21eb]"
                    : "bg-white text-[#5a2dff] hover:bg-[#efe7ff]"
                } ${isSaving ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {isSaving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hủy
                </button>
              )}
            </div>
          </header>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h2>
            <p className="text-sm text-gray-500">Cập nhật thông tin hồ sơ của bạn</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {personalInfoConfig.left.map(({ key, label }) => {
                  const value = personalInfo[key];
                  const isEmpty = !value || value === "Chưa cập nhật";
                  return (
                    <label key={key} className="block space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-400">{label}</span>
                      <input
                        value={value}
                        onChange={(event) => handlePersonalInfoChange(key, event.target.value)}
                        disabled={!isEditing || key === "email"} // Không cho sửa email
                        placeholder="Chưa cập nhật"
                        className={`h-11 w-full rounded-2xl border px-4 text-sm font-semibold outline-none transition ${
                          isEditing && key !== "email"
                            ? "border-[#d6d7e4] bg-white text-gray-900 focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                            : `border-transparent bg-[#f7f7fb] ${
                                isEmpty ? "text-gray-400" : "text-gray-900"
                              } ${key === "email" ? "cursor-not-allowed text-gray-500" : ""}`
                        }`}
                      />
                    </label>
                  );
                })}
              </div>
              <div className="space-y-4">
                {personalInfoConfig.right.map(({ key, label }) => {
                  const value = personalInfo[key];
                  const isEmpty = !value || value === "Chưa cập nhật";
                  return (
                    <label key={key} className="block space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-400">{label}</span>
                      <input
                        value={value}
                        onChange={(event) => handlePersonalInfoChange(key, event.target.value)}
                        disabled={!isEditing || key === "email"}
                        placeholder="Chưa cập nhật"
                        className={`h-11 w-full rounded-2xl border px-4 text-sm font-semibold outline-none transition ${
                          isEditing && key !== "email"
                            ? "border-[#d6d7e4] bg-white text-gray-900 focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                            : `border-transparent bg-[#f7f7fb] ${
                                isEmpty ? "text-gray-400" : "text-gray-900"
                              } ${key === "email" ? "cursor-not-allowed text-gray-500" : ""}`
                        }`}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-400">
                  Giới thiệu bản thân
                </span>
                <textarea
                  value={about}
                  onChange={(event) => setAbout(event.target.value)}
                  disabled={!isEditing}
                  placeholder="Giới thiệu bản thân"
                  className={`min-h-[120px] w-full rounded-2xl border p-4 text-sm outline-none transition ${
                    isEditing
                      ? "border-[#d6d7e4] bg-white text-gray-700 focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                      : "border-[#e4e6f1] bg-[#f7f7fb] text-gray-600"
                  }`}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-400">Website</span>
                <input
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  disabled={!isEditing}
                  placeholder="https://"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                    isEditing
                      ? "border-[#d6d7e4] bg-white text-[#5a2dff] focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                      : "border-[#e4e6f1] bg-[#f7f7fb] text-[#5a2dff]"
                  }`}
                />
              </label>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">Kỹ năng</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {userSkills.map((skill) => (
                    <span
                      key={skill}
                      className="group inline-flex items-center gap-2 rounded-full border border-[#5a2dff]/30 bg-[#5a2dff]/10 px-3 py-1 text-xs font-semibold text-[#5a2dff]"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-rose-500 transition hover:text-rose-600"
                          aria-label={`Xóa kỹ năng ${skill}`}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(event) => {
                          setNewSkill(event.target.value);
                          if (skillError) setSkillError(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Nhập kỹ năng mới"
                        className="h-11 min-w-[200px] flex-1 rounded-2xl border border-[#d6d7e4] px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="inline-flex items-center rounded-full bg-[#5a2dff] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Thêm kỹ năng
                      </button>
                    </div>
                    {skillError && <p className="text-xs font-semibold text-rose-500">{skillError}</p>}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Liên kết mạng xã hội</h2>
              <button
                type="button"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                  isEditing
                    ? "bg-[#5a2dff] text-white shadow-sm shadow-[#5a2dff]/30 hover:bg-[#4a21eb]"
                    : "cursor-not-allowed border border-[#e4e6f1] bg-[#f7f7fb] text-gray-400"
                }`}
                onClick={() => {
                  if (!isEditing) return;
                  console.log("Saved links", socialLinks);
                  // API của bạn chưa có endpoint cho social links
                  // Khi có, bạn sẽ gọi một hook mutation tương tự ở đây
                }}
                disabled={!isEditing}
              >
                Lưu liên kết
              </button>
            </div>
            <p className="text-sm text-gray-500">Thêm các liên kết mạng xã hội của bạn</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {socialLinks.map(({ label, placeholder, value, Icon }, index) => (
                <label key={label} className="space-y-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <Icon className="h-4 w-4 text-[#5a2dff]" />
                    {label}
                  </span>
                  <div
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                      isEditing
                        ? "border-[#d6d7e4] bg-white focus-within:border-[#5a2dff] focus-within:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                        : "border-[#e4e6f1] bg-[#f7f7fb]"
                    }`}
                  >
                    <input
                      value={value}
                      onChange={(event) => handleSocialChange(index, event.target.value)}
                      disabled={!isEditing}
                      placeholder={placeholder}
                      className="w-full bg-transparent text-sm font-medium text-gray-700 placeholder-gray-400 outline-none"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AvatarLayout>
  );
};

export default MyInfo;