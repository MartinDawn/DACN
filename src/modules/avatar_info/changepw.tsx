import React, { useState, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  LockClosedIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ShieldExclamationIcon
} from "@heroicons/react/24/outline";
import AvatarLayout from "./layout/layout";
import PostCard from "./components/post_card";

// Utility function to check password strength
const checkPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score === 0) return { score: 0, label: "Very Weak", color: "red" };
  if (score <= 2) return { score: score * 20, label: "Weak", color: "red" };
  if (score <= 3) return { score: score * 20, label: "Fair", color: "orange" };
  if (score <= 4) return { score: score * 20, label: "Good", color: "yellow" };
  return { score: 100, label: "Strong", color: "green" };
};

const ChangePasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength
  const passwordStrength = checkPasswordStrength(form.newPassword);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: "error", message: t('changePassword.messages.mismatch') });
      return;
    }

    if (passwordStrength.score < 60) {
      setStatus({ type: "error", message: t('changePassword.messages.weakPassword') });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated delay
      setStatus({ type: "success", message: t('changePassword.messages.success') });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setStatus({ type: "error", message: t('changePassword.messages.error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AvatarLayout>
      <div className="grid gap-10 lg:grid-cols-[400px,minmax(0,1fr)]">
        <aside className="space-y-8">
          <section className="rounded-3xl bg-white p-8 shadow-lg shadow-indigo-100/50 border border-indigo-100/50 space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 animate-pulse"></div>
                <KeyIcon className="h-8 w-8 text-white relative z-10" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {t('changePassword.title')}
              </h1>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {t('changePassword.description')}
              </p>
            </div>
            <div className="space-y-4">
              <PostCard
                icon={<ShieldCheckIcon className="w-5 h-5 text-emerald-600" />}
                title={t('changePassword.tips.strongPassword')}
                description={t('changePassword.tips.strongPasswordDesc')}
                gradient="from-emerald-50 to-emerald-100"
              />
              <PostCard
                icon={<ShieldExclamationIcon className="w-5 h-5 text-amber-600" />}
                title={t('changePassword.tips.dontShare')}
                description={t('changePassword.tips.dontShareDesc')}
                gradient="from-amber-50 to-amber-100"
              />
            </div>
          </section>
        </aside>
        <section className="rounded-3xl bg-white p-8 shadow-lg shadow-gray-200/50 border border-gray-100/50">
          <div className="mb-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {t('changePassword.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('changePassword.instruction')}
            </p>
          </div>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Current Password Field */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2" htmlFor="currentPassword">
                <LockClosedIcon className="h-4 w-4 text-gray-600" />
                {t('changePassword.form.currentPassword')}
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={form.currentPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-12 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t('changePassword.form.currentPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password Field with Strength Indicator */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2" htmlFor="newPassword">
                <KeyIcon className="h-4 w-4 text-gray-600" />
                {t('changePassword.form.newPassword')}
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.newPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 pr-12 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t('changePassword.form.newPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Password Strength</span>
                    <span className={`font-semibold ${
                      passwordStrength.color === 'green' ? 'text-emerald-600' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                      passwordStrength.color === 'orange' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        passwordStrength.color === 'green' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                        passwordStrength.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        passwordStrength.color === 'orange' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700 font-medium">
                  {t('changePassword.form.newPasswordHint')}
                </p>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-800 flex items-center gap-2" htmlFor="confirmPassword">
                <CheckCircleIcon className="h-4 w-4 text-gray-600" />
                {t('changePassword.form.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`h-12 w-full rounded-2xl border px-4 pr-12 text-sm outline-none transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    form.confirmPassword && form.newPassword
                      ? form.confirmPassword === form.newPassword
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
                        : 'border-red-200 bg-red-50 text-red-700 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-gray-200 bg-gray-50 text-gray-700 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100'
                  }`}
                  placeholder={t('changePassword.form.confirmPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                {/* Match/Mismatch Indicator */}
                {form.confirmPassword && form.newPassword && (
                  <div className="absolute inset-y-0 right-10 flex items-center pr-2">
                    {form.confirmPassword === form.newPassword ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Status Messages with Enhanced Design */}
            {status && (
              <div
                className={`rounded-2xl px-6 py-4 text-sm font-medium border flex items-center gap-3 ${
                  status.type === "success"
                    ? "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200"
                } animate-in slide-in-from-top duration-300`}
              >
                {status.type === "success" ? (
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                )}
                {status.message}
              </div>
            )}

            {/* Action Buttons with Loading States */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || passwordStrength.score < 60}
                className={`h-12 rounded-full px-8 text-sm font-semibold shadow-lg transition-all duration-200 disabled:cursor-not-allowed ${
                  isSubmitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : passwordStrength.score < 60 && form.newPassword
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    {t('changePassword.buttons.saving')}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <KeyIcon className="h-4 w-4" />
                    {t('changePassword.buttons.save')}
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setStatus(null);
                }}
                disabled={isSubmitting}
                className="h-12 rounded-full border border-gray-300 bg-white px-8 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('changePassword.buttons.cancel')}
              </button>
            </div>
          </form>
        </section>
      </div>
    </AvatarLayout>
  );
};

export default ChangePasswordPage;
