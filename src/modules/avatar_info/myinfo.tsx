import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, CameraIcon, PencilSquareIcon, CheckIcon } from "@heroicons/react/24/outline";
import { FaGithub, FaLinkedinIn, FaTwitter, FaInstagram, FaFacebookF } from "react-icons/fa";
import AvatarLayout from "./layout/layout";
import PostCard from "./components/post_card";

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
  { label: "GitHub", placeholder: "https://github.com/username", value: "https://github.com/username", Icon: FaGithub },
  { label: "LinkedIn", placeholder: "https://linkedin.com/in/username", value: "https://linkedin.com/in/username", Icon: FaLinkedinIn },
  { label: "Twitter", placeholder: "https://twitter.com/username", value: "https://twitter.com/username", Icon: FaTwitter },
  { label: "Instagram", placeholder: "https://instagram.com/username", value: "https://instagram.com/username", Icon: FaInstagram },
  { label: "Facebook", placeholder: "https://facebook.com/username", value: "https://facebook.com/username", Icon: FaFacebookF },
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

const initialPersonalInfo: PersonalInfo = {
  fullName: "username",
  jobTitle: "Lập trình viên Full-stack",
  phone: "+84 987 654 321",
  address: "Hồ Chí Minh, Việt Nam",
  email: "vnt@gmail.com",
  company: "FPT Software",
  birthday: "15/06/1995",
  gender: "Nam",
  experience: "",
};

const initialAbout =
  "Tôi là một học viên đam mê công nghệ, luôn tìm kiếm các cơ hội để nâng cao kiến thức và kỹ năng của mình.";
const initialWebsite = "https://myportfolio.com";

type ProfileSnapshot = {
  personalInfo: PersonalInfo;
  about: string;
  website: string;
  socialLinks: SocialLink[];
  skills: string[];
  avatarPreview: string | null;
};

const MyInfo: React.FC = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [personalInfo, setPersonalInfo] = React.useState<PersonalInfo>(initialPersonalInfo);
  const [about, setAbout] = React.useState(initialAbout);
  const [website, setWebsite] = React.useState(initialWebsite);
  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>(socialLinkDefaults);
  const [userSkills, setUserSkills] = React.useState<string[]>(defaultSkills);
  const [newSkill, setNewSkill] = React.useState("");
  const [skillError, setSkillError] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const profileSnapshotRef = React.useRef<ProfileSnapshot | null>(null);

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

  const uploadAvatar = React.useCallback(async (): Promise<boolean> => {
    if (!avatarFile) return true;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Avatar upload failed");

      const { avatarUrl } = await response.json();

      setAvatarPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return avatarUrl;
      });

      return true;
    } catch (error) {
      console.error("Avatar upload failed", error);
      return false;
    } finally {
      setAvatarFile(null);
    }
  }, [avatarFile]);

  const handleToggleEdit = async () => {
    if (isSaving) return;
    if (!isEditing) {
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
    try {
      setIsSaving(true);
      const avatarUploaded = await uploadAvatar();
      if (!avatarUploaded) {
        console.warn("Không thể tải ảnh đại diện lên máy chủ.");
      }
      console.log("Saved profile", {
        personalInfo,
        about,
        website,
        socialLinks,
        skills: userSkills,
      });
      profileSnapshotRef.current = null;
      setIsEditing(false);
      setNewSkill("");
      setSkillError(null);
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(
    () => () => {
      if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview]
  );

  return (
    <AvatarLayout>
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
            <h2 className="text-lg font-bold text-gray-900">username</h2>
            <p className="text-sm font-medium text-[#5a2dff]">Lập trình viên Full-stack</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">FPT Software</p>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <span>📍</span> Hồ Chí Minh, Việt Nam
              </div>
              <div className="flex items-center justify-center gap-2">
                <span>🗓</span> Thành viên từ 2025
              </div>
            </div>
            {/* <div className="mt-5 flex items-center justify-center gap-3 text-lg text-gray-500">
              <span>💬</span>
              <span>💼</span>
              <span>🔗</span>
            </div> */}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Thống kê học tập</h3>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>Tiến độ hoàn thành</span>
                <span>67%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div className="h-full w-[67%] rounded-full bg-[#5a2dff]" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center text-sm font-semibold text-gray-700">
              <div className="rounded-2xl bg-[#5a2dff]/5 p-3">
                <p className="text-2xl font-bold text-[#5a2dff]">156</p>
                <p className="text-xs uppercase text-gray-500">Giờ học</p>
              </div>
              <div className="rounded-2xl bg-[#5a2dff]/5 p-3">
                <p className="text-2xl font-bold text-[#5a2dff]">6</p>
                <p className="text-xs uppercase text-gray-500">Chứng chỉ</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
                <span>🔥 Streak hiện tại</span>
                <span className="font-semibold text-gray-900">15 ngày</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
                <span>⭐ Đánh giá TB</span>
                <span className="font-semibold text-gray-900">4.7/5.0</span>
              </div>
            </div>
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
                disabled={isSaving}
                className={`inline-flex items-center gap-2 rounded-full border border-[#5a2dff] px-5 py-2 text-sm font-semibold transition ${
                  isEditing ? "bg-[#5a2dff] text-white hover:bg-[#4a21eb]" : "bg-white text-[#5a2dff] hover:bg-[#efe7ff]"
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
                  const isEmpty = !value.trim();
                  return (
                    <label key={key} className="block space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-400">{label}</span>
                      <input
                        value={value}
                        onChange={(event) => handlePersonalInfoChange(key, event.target.value)}
                        disabled={!isEditing}
                        placeholder="Chưa cập nhật"
                        className={`h-11 w-full rounded-2xl border px-4 text-sm font-semibold outline-none transition ${
                          isEditing
                            ? "border-[#d6d7e4] bg-white text-gray-900 focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                            : `border-transparent bg-[#f7f7fb] ${isEmpty ? "text-gray-400" : "text-gray-900"}`
                        }`}
                      />
                    </label>
                  );
                })}
              </div>
              <div className="space-y-4">
                {personalInfoConfig.right.map(({ key, label }) => {
                  const value = personalInfo[key];
                  const isEmpty = !value.trim();
                  return (
                    <label key={key} className="block space-y-1">
                      <span className="text-xs font-semibold uppercase text-gray-400">{label}</span>
                      <input
                        value={value}
                        onChange={(event) => handlePersonalInfoChange(key, event.target.value)}
                        disabled={!isEditing}
                        placeholder="Chưa cập nhật"
                        className={`h-11 w-full rounded-2xl border px-4 text-sm font-semibold outline-none transition ${
                          isEditing
                            ? "border-[#d6d7e4] bg-white text-gray-900 focus:border-[#5a2dff] focus:shadow-[0_0_0_1px_rgba(98,70,234,0.12)]"
                            : `border-transparent bg-[#f7f7fb] ${isEmpty ? "text-gray-400" : "text-gray-900"}`
                        }`}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase text-gray-400">Giới thiệu bản thân</span>
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
