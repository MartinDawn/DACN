// src/components/MyInfo.tsx

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  CameraIcon,
  MapPinIcon,
  CalendarIcon,
  FireIcon,
  StarIcon,
  DocumentIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
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
import { type UserProfileStats } from "./models/userProfile.model"; // <-- Cập nhật đường dẫn này

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

// Giá trị khởi tạo tạm thời khi chờ API


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
  const { t } = useTranslation();

  // Define personalInfoConfig inside component to access t()
  const personalInfoConfig: Record<"left" | "right", Array<{ key: keyof PersonalInfo; label: string }>> = React.useMemo(() => ({
    left: [
      { key: "fullName", label: t('profile.personalInfoLabels.fullName') },
      { key: "jobTitle", label: t('profile.personalInfoLabels.jobTitle') },
      { key: "phone", label: t('profile.personalInfoLabels.phone') },
      { key: "address", label: t('profile.personalInfoLabels.address') },
    ],
    right: [
      { key: "email", label: t('profile.personalInfoLabels.email') },
      { key: "company", label: t('profile.personalInfoLabels.company') },
      { key: "birthday", label: t('profile.personalInfoLabels.birthday') },
      { key: "gender", label: t('profile.personalInfoLabels.gender') },
      { key: "experience", label: t('profile.personalInfoLabels.experience') },
    ],
  }), [t]);

  // Effect để cập nhật initialPersonalInfo với translation
  const initialPersonalInfoTranslated = React.useMemo(() => ({
    fullName: t('common.loading') || "Đang tải...",
    jobTitle: t('common.loading') || "Đang tải...",
    phone: t('common.loading') || "Đang tải...",
    address: t('common.loading') || "Đang tải...",
    email: t('common.loading') || "Đang tải...",
    company: t('common.loading') || "Đang tải...",
    birthday: t('common.loading') || "Đang tải...",
    gender: t('common.loading') || "Đang tải...",
    experience: t('common.loading') || "Đang tải...",
  }), [t]);

  // --- STATE TỪ COMPONENT ---
  const [isEditing, setIsEditing] = React.useState(false);
  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo>(initialPersonalInfoTranslated);
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
        fullName: profileData.fullName || t('profile.placeholders.notUpdated'),
        jobTitle: profileData.jobPosition || t('profile.placeholders.notUpdated'),
        phone: profileData.phoneNumber || t('profile.placeholders.notUpdated'),
        address: profileData.location || t('profile.placeholders.notUpdated'),
        email: profileData.email || t('profile.placeholders.notUpdated'),
        company: profileData.organization || t('profile.placeholders.notUpdated'),
        birthday: formatBirthDateToInput(profileData.birthDate),
        gender: profileData.gender || t('profile.placeholders.notUpdated'),
        experience: profileData.experience || t('profile.placeholders.notUpdated'),
      });
      setAbout(profileData.description || t('profile.placeholders.notUpdated'));
      setAvatarPreview(profileData.avatarUrl || null);

      // Cập nhật state sidebar
      setUsername(profileData.username);
      setStats(profileData.stats);
      setMemberSinceYear(profileData.memberSinceYear);
      setLocation(profileData.location || t('profile.placeholders.notUpdated'));

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
      setSkillError(t('profile.skills.errorInvalid'));
      return;
    }
    if (userSkills.some((skill) => skill.toLowerCase() === candidate.toLowerCase())) {
      setSkillError(t('profile.skills.errorExists'));
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
      } else if (avatarFile && avatarPreview?.startsWith("blob:") && !result.success) {
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
          <p className="text-lg font-semibold text-[#5a2dff]">{t('profile.loading')}</p>
        </div>
      </AvatarLayout>
    );
  }

  return (
    <AvatarLayout>
      {/* Thêm Toaster để nhận thông báo từ hook */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          to="/user/home"
          className="inline-flex items-center gap-3 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6] group"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#efe7ff] to-[#f3f0ff] border border-[#5a2dff]/20 group-hover:from-[#5a2dff] group-hover:to-[#7c3aed] transition-all duration-200">
            <ArrowLeftIcon className="h-4 w-4 group-hover:text-white transition-colors" />
          </span>
          {t('profile.backToHome')}
        </Link>
        <div className="hidden items-center gap-3 text-sm font-medium text-gray-500 md:flex">
          {[
            t('profile.tabs.info'),
            t('profile.tabs.achievements'),
            t('profile.tabs.security'),
            t('profile.tabs.notifications'),
            t('profile.tabs.privacy'),
            t('profile.tabs.payment')
          ].map(
            (label, index) => (
              <button
                key={label}
                type="button"
                className={`rounded-full px-5 py-2.5 transition-all duration-200 ${
                  index === 0
                    ? "bg-gradient-to-r from-white to-gray-50 text-[#5a2dff] shadow-md border border-[#5a2dff]/20"
                    : "hover:bg-gradient-to-r hover:from-white hover:to-gray-50 hover:text-[#5a2dff] hover:shadow-sm"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[380px,minmax(0,1fr)]">
        <aside className="space-y-8">
          <section className="rounded-3xl bg-white p-6 text-center shadow-lg shadow-[#5a2dff]/10 border border-[#5a2dff]/10">
            <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a2dff]/20 to-[#3c1cd6]/20">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold bg-gradient-to-br from-[#5a2dff] to-[#3c1cd6] text-white">
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
                className={`absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition ${
                  isEditing ? "bg-gradient-to-r from-[#5a2dff] to-[#4a21eb] text-white hover:from-[#4a21eb] hover:to-[#3c1cd6]" : "cursor-not-allowed bg-gray-300 text-gray-500"
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
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#5a2dff]/10">
                  <MapPinIcon className="w-3 h-3 text-[#5a2dff]" />
                </div>
                <span>{location}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
                  <CalendarIcon className="w-3 h-3 text-emerald-600" />
                </div>
                <span>{t('profile.sidebar.memberSince')} {memberSinceYear || "..."}</span>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-lg shadow-[#5a2dff]/10 border border-[#5a2dff]/5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
              {t('profile.sidebar.learningStats')}
            </h3>
            {/* Dữ liệu từ API */}
            {stats ? (
              <>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                    <span>{t('profile.sidebar.completionProgress')}</span>
                    <span className="font-bold">{stats.completionProgress}%</span>
                  </div>
                  <div className="mt-3 h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#5a2dff] to-[#7c3aed] transition-all duration-500 ease-out"
                      style={{ width: `${stats.completionProgress}%` }}
                    />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-center text-sm font-semibold text-gray-700">
                  <div className="rounded-2xl bg-gradient-to-br from-[#5a2dff]/5 via-[#5a2dff]/10 to-[#7c3aed]/5 p-4 shadow-sm border border-[#5a2dff]/20">
                    <p className="text-2xl font-bold bg-gradient-to-r from-[#5a2dff] to-[#7c3aed] bg-clip-text text-transparent">{stats.totalHours}</p>
                    <p className="text-xs uppercase text-gray-500">{t('profile.sidebar.studyHours')}</p>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50 p-4 shadow-sm border border-emerald-200">
                    <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats.totalCertificates}</p>
                    <p className="text-xs uppercase text-gray-500">{t('profile.sidebar.certificates')}</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100">
                        <FireIcon className="w-4 h-4 text-orange-600" />
                      </div>
                      <span>{t('profile.sidebar.currentStreak')}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats.currentStreak} {t('profile.sidebar.days')}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100">
                        <StarIcon className="w-4 h-4 text-amber-600" />
                      </div>
                      <span>{t('profile.sidebar.averageRating')}</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {stats.averageGivenRating.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-gray-500">{t('profile.sidebar.noStats')}</p>
            )}
            <Link
              to="/user/mycourses"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5a2dff] to-[#7c3aed] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5a2dff]/30 transition hover:from-[#4a21eb] hover:to-[#6d28d9] hover:shadow-xl hover:shadow-[#5a2dff]/40 hover:-translate-y-0.5"
            >
              {t('profile.sidebar.viewMyCourses')}
            </Link>
          </section>

          <section className="space-y-3">
            <PostCard
              icon={<DocumentIcon className="w-5 h-5 text-blue-600" />}
              title={t('profile.quickActions.downloadCertificate')}
              description={t('profile.quickActions.downloadCertificateDesc')}
              asButton
              gradient="from-blue-50 to-blue-100"
            />
            <PostCard
              icon={<ChartBarSquareIcon className="w-5 h-5 text-green-600" />}
              title={t('profile.quickActions.progressReport')}
              description={t('profile.quickActions.progressReportDesc')}
              asButton
              gradient="from-green-50 to-green-100"
            />
            <PostCard
              icon={<Cog6ToothIcon className="w-5 h-5 text-purple-600" />}
              title={t('profile.quickActions.advancedSettings')}
              description={t('profile.quickActions.advancedSettingsDesc')}
              asButton
              gradient="from-purple-50 to-purple-100"
            />
          </section>
        </aside>

        <section className="space-y-8">
          <header className="rounded-3xl border border-[#5a2dff]/20 bg-gradient-to-r from-[#efeaff] via-white to-[#f3f0ff] p-6 shadow-lg shadow-[#5a2dff]/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{t('profile.title')}</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {t('profile.subtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleEdit}
                disabled={isSaving} // Lấy từ hook
                className={`inline-flex items-center gap-2 rounded-full border border-[#5a2dff]/30 px-5 py-2.5 text-sm font-semibold transition shadow-md ${
                  isEditing
                    ? "bg-gradient-to-r from-[#5a2dff] to-[#7c3aed] text-white shadow-[#5a2dff]/30 hover:from-[#4a21eb] hover:to-[#6d28d9] hover:shadow-lg hover:shadow-[#5a2dff]/40"
                    : "bg-white text-[#5a2dff] hover:bg-gradient-to-r hover:from-[#efe7ff] hover:to-[#f3f0ff]"
                } ${isSaving ? "cursor-not-allowed opacity-70" : ""}`}
              >
                {isSaving ? t('profile.buttons.saving') : isEditing ? t('profile.buttons.save') : t('profile.buttons.edit')}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('common.cancel')}
                </button>
              )}
            </div>
          </header>

          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-gray-200/50 border border-gray-100/50">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{t('profile.sections.personalInfo')}</h2>
            <p className="text-sm text-gray-600">{t('profile.sections.personalInfoDesc')}</p>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {personalInfoConfig.left.map(({ key, label }) => {
                  const value = personalInfo[key];
                  const isEmpty = !value || value === t('profile.placeholders.notUpdated');
                  return (
                    <label key={key} className="block space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-400">{label}</span>
                      <input
                        value={value}
                        onChange={(event) => handlePersonalInfoChange(key, event.target.value)}
                        disabled={!isEditing || key === "email"} // Không cho sửa email
                        placeholder={t('profile.placeholders.notUpdated')}
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
                  const isEmpty = !value || value === t('profile.placeholders.notUpdated');
                  return (
                    <label key={key} className="block space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-400">{label}</span>
                      <input
                        value={value}
                        onChange={(event) => handlePersonalInfoChange(key, event.target.value)}
                        disabled={!isEditing || key === "email"}
                        placeholder={t('profile.placeholders.notUpdated')}
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
                  {t('profile.sections.selfIntro')}
                </span>
                <textarea
                  value={about}
                  onChange={(event) => setAbout(event.target.value)}
                  disabled={!isEditing}
                  placeholder={t('profile.placeholders.selfIntroduction')}
                  className={`min-h-[120px] w-full rounded-2xl border p-4 text-sm outline-none transition ${
                    isEditing
                      ? "border-[#d6d7e4] bg-white text-gray-700 focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                      : "border-[#e4e6f1] bg-[#f7f7fb] text-gray-600"
                  }`}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-400">{t('profile.sections.website')}</span>
                <input
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  disabled={!isEditing}
                  placeholder={t('profile.placeholders.website')}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition ${
                    isEditing
                      ? "border-[#d6d7e4] bg-white text-[#5a2dff] focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                      : "border-[#e4e6f1] bg-[#f7f7fb] text-[#5a2dff]"
                  }`}
                />
              </label>
              <div>
                <span className="text-xs font-semibold uppercase text-gray-400">{t('profile.sections.skills')}</span>
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
                          aria-label={t('profile.skills.removeAriaLabel', { skill })}
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
                        placeholder={t('profile.skills.newPlaceholder')}
                        className="h-11 min-w-[200px] flex-1 rounded-2xl border border-[#d6d7e4] px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="inline-flex items-center rounded-full bg-[#5a2dff] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[#5a2dff]/30 transition hover:bg-[#4a21eb] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t('profile.skills.add')}
                      </button>
                    </div>
                    {skillError && <p className="text-xs font-semibold text-rose-500">{skillError}</p>}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-gray-200/50 border border-gray-100/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{t('profile.sections.socialLinks')}</h2>
              <button
                type="button"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                  isEditing
                    ? "bg-gradient-to-r from-[#5a2dff] to-[#7c3aed] text-white shadow-lg shadow-[#5a2dff]/30 hover:from-[#4a21eb] hover:to-[#6d28d9]"
                    : "cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400"
                }`}
                onClick={() => {
                  if (!isEditing) return;
                  // API của bạn chưa có endpoint cho social links
                  // Khi có, bạn sẽ gọi một hook mutation tương tự ở đây
                }}
                disabled={!isEditing}
              >
                {t('profile.sections.saveLinks')}
              </button>
            </div>
            <p className="text-sm text-gray-600">{t('profile.sections.socialLinksDesc')}</p>
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