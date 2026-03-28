import React, { useState, useEffect, useMemo} from "react";
import { Link } from "react-router-dom";
// import { Link, useNavigate } from "react-router-dom";

import { useTranslation } from 'react-i18next';
import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";

// 1. IMPORT HOOKS
import { useCart } from "./hooks/useCart";
import { useUserProfileData } from "../avatar_info/hooks/useUserProfile";
import { usePayment } from "./hooks/usePayment"; // <-- Import hook mới



const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const CheckoutPage: React.FC = () => {
  // const navigate = useNavigate();
  const { t } = useTranslation();

  const paymentMethods = [
    {
      value: "card",
      label: t('checkout.paymentMethod.creditCard'),
      description: t('checkout.paymentMethod.creditCardDesc'),
      Icon: CreditCardIcon,
    },
    {
      value: "vnpay", // Đổi key để dễ xử lý logic
      label: t('checkout.paymentMethod.vnpay'),
      description: t('checkout.paymentMethod.vnpayDesc'),
      Icon: BuildingLibraryIcon,
    },
    {
      value: "wallet",
      label: t('checkout.paymentMethod.wallet'),
      description: t('checkout.paymentMethod.walletDesc'),
      Icon: DevicePhoneMobileIcon,
    },
  ];
  
  // 2. LẤY DỮ LIỆU TỪ CÁC HOOK
  const { cart, loading: isCartLoading, error: cartError } = useCart();
  const { 
    profileData, 
    isLoading: isProfileLoading, 
    fetchProfile 
  } = useUserProfileData();
  
  // Hook thanh toán mới
  const { initiateVnPayPayment, isProcessing: isPaymentProcessing, paymentError } = usePayment();
  
  const selectedItems = useMemo(() => cart?.items ?? [], [cart]);

  // State form thanh toán
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].value);
  const [agreed, setAgreed] = useState(false);
  
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profileData) {
      setForm((prev) => ({
        ...prev,
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        phone: profileData.phoneNumber || "",
        city: profileData.location || "",
        cardName: profileData.fullName.toUpperCase() || "", 
      }));
    }
  }, [profileData]);

  const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const discount = 0; 
  const priceAfterDiscount = subtotal - discount;
  const vat = Math.round(priceAfterDiscount * 0.08); 
  const total = priceAfterDiscount + vat;

  const handleChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  // --- HÀM XỬ LÝ SUBMIT ---
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agreed) return;
    
    // Lấy danh sách ID khóa học
    const courseIds = selectedItems.map(item => item.id); 

    if (paymentMethod === 'vnpay') {
        // Gọi thanh toán VNPay
        await initiateVnPayPayment(courseIds);
        // Lưu ý: initiateVnPayPayment sẽ redirect trang web nếu thành công,
        // nên code phía sau dòng này có thể không chạy.
    } else if (paymentMethod === 'card') {
        // Xử lý thanh toán thẻ (Logic cũ hoặc API khác)
        alert(t('checkout.errors.cardMethodUnavailable'));
        // navigate("/user/mycourses");
    } else {
        alert(t('checkout.errors.methodUnavailable'));
    }
  };

  const isCardMethod = paymentMethod === "card";
  const isLoading = isCartLoading || isProfileLoading;
  const apiError = cartError || (profileData === null && !isProfileLoading ? t('user.profileLoadError') : null);

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex h-96 items-center justify-center">
            <div className="text-center">{t('checkout.loading')}</div>
        </div>
      </UserLayout>
    );
  }
  
  if (apiError) {
    return (
      <UserLayout>
        <div className="flex h-96 items-center justify-center">
            <div className="text-center text-red-500">{apiError}</div>
        </div>
      </UserLayout>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <UserLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-semibold">{t('checkout.empty.title')}</p>
          <Link to="/courses" className="rounded-full bg-[#5a2dff] px-5 py-2 text-sm font-semibold text-white">
            {t('checkout.empty.exploreCourses')}
          </Link>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="mx-auto max-w-5xl space-y-8 py-8 px-4">
        <header className="space-y-2">
          <Link
            to="/user/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t('checkout.backToCart')}
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">{t('checkout.title')}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('checkout.subtitle')}
          </p>
        </header>

        {/* Hiển thị lỗi thanh toán nếu có */}
        {paymentError && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                <span className="font-medium">{t('user.paymentError')}</span> {paymentError}
            </div>
        )}

        <form className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]" onSubmit={handleSubmit}>
          <section className="space-y-8">
            {/* Thông tin thanh toán */}
            <div className="rounded-3xl border border-gray-100 p-6 shadow-sm bg-white">
              <h3 className="text-lg font-semibold text-gray-900">{t('checkout.buyerInfo.title')}</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-gray-600">
                  {t('checkout.buyerInfo.fullName')}
                  <input
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                    placeholder={t('checkout.buyerInfo.fullNamePlaceholder')}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-gray-600">
                  {t('checkout.buyerInfo.email')}
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                    placeholder={t('checkout.buyerInfo.emailPlaceholder')}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-gray-600">
                  {t('checkout.buyerInfo.phone')}
                  <input
                    value={form.phone}
                    onChange={handleChange("phone")}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                    placeholder={t('checkout.buyerInfo.phonePlaceholder')}
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-gray-600">
                  {t('checkout.buyerInfo.city')}
                  <input
                    value={form.city}
                    onChange={handleChange("city")}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                    placeholder={t('checkout.buyerInfo.cityPlaceholder')}
                    required
                  />
                </label>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="rounded-3xl border border-gray-100 p-6 shadow-sm bg-white">
              <h3 className="text-lg font-semibold text-gray-900">{t('checkout.paymentMethod.title')}</h3>
              <div className="mt-5 space-y-3">
                {paymentMethods.map(({ value, label, description, Icon }) => {
                  const active = paymentMethod === value;
                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                        active ? "border-[#5a2dff] bg-[#f4f0ff] text-[#5a2dff]" : "border-gray-200 text-gray-600 hover:border-[#5a2dff]/60"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={value}
                        checked={active}
                        onChange={() => setPaymentMethod(value)}
                        className="mt-1 h-4 w-4 text-[#5a2dff]"
                      />
                      <div className="flex flex-1 items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#5a2dff] shadow-sm border border-gray-100">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{label}</p>
                          {description && <p className="text-xs text-gray-500">{description}</p>}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Chi tiết thẻ - Chỉ hiện khi chọn Card */}
              {isCardMethod && (
                  <div className={`mt-6 grid gap-4 rounded-2xl bg-[#f8f8ff] p-5 animate-in fade-in slide-in-from-top-2`}>
                    <h4 className="text-sm font-semibold text-gray-900">{t('checkout.cardDetails.title')}</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                       <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                         {t('checkout.cardDetails.cardNumber')}
                         <input
                           value={form.cardNumber}
                           onChange={handleChange("cardNumber")}
                           className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10 bg-white"
                           placeholder={t('checkout.cardDetails.cardNumberPlaceholder')}
                           required={isCardMethod}
                         />
                       </label>
                       <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                         {t('checkout.cardDetails.cardName')}
                         <input
                           value={form.cardName}
                           onChange={handleChange("cardName")}
                           className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10 bg-white"
                           placeholder={t('checkout.cardDetails.cardNamePlaceholder')}
                           required={isCardMethod}
                         />
                       </label>
                       <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                         {t('checkout.cardDetails.expiry')}
                         <input
                           value={form.expiry}
                           onChange={handleChange("expiry")}
                           className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10 bg-white"
                           placeholder={t('checkout.cardDetails.expiryPlaceholder')}
                           required={isCardMethod}
                         />
                       </label>
                       <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                         {t('checkout.cardDetails.cvv')}
                         <input
                           value={form.cvv}
                           onChange={handleChange("cvv")}
                           className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10 bg-white"
                           placeholder={t('checkout.cardDetails.cvvPlaceholder')}
                           required={isCardMethod}
                         />
                       </label>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <LockClosedIcon className="h-3 w-3"/> {t('checkout.cardDetails.securityInfo')}
                    </p>
                  </div>
              )}
            </div>
          </section>

          {/* Sidebar tóm tắt đơn hàng */}
          <aside className="space-y-6 rounded-3xl border border-gray-100 p-6 shadow-sm bg-white lg:sticky lg:top-28 h-fit">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">{t('checkout.orderSummary.title')}</h3>
              <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <img src={item.imageUrl || "https://placehold.co/150"} alt={item.name} className="h-16 w-24 rounded-lg object-cover bg-gray-100" />
                      <div className="flex-1 space-y-1 text-sm">
                        <h4 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h4>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-gray-800">{currencyFormatter.format(item.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
              <div className="space-y-2 text-gray-500">
                <div className="flex justify-between">
                  <span>{t('checkout.orderSummary.subtotal')}</span>
                  <span className="font-semibold text-gray-900">{currencyFormatter.format(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>{t('checkout.orderSummary.discount')}</span>
                    <span>- {currencyFormatter.format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t('checkout.orderSummary.tax')}</span>
                  <span>{currencyFormatter.format(vat)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>{t('checkout.orderSummary.total')}</span>
                <span className="text-[#5a2dff]">{currencyFormatter.format(total)}</span>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-600 bg-gray-50 hover:bg-white transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#5a2dff] focus:ring-[#5a2dff]"
              />
              <span>
                {t('checkout.terms.agree')}{" "}
                <button type="button" className="font-semibold text-[#5a2dff] hover:underline">
                  {t('checkout.terms.terms')}
                </button>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={!agreed || isPaymentProcessing}
              className={`w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition shadow-lg shadow-[#5a2dff]/20 ${
                agreed && !isPaymentProcessing ? "bg-[#5a2dff] hover:bg-[#3c1cd6] hover:-translate-y-0.5" : "cursor-not-allowed bg-[#b9a8ff]"
              }`}
            >
              {isPaymentProcessing ? t('checkout.orderSummary.processing') : `${t('checkout.completePayment')} ${currencyFormatter.format(total)}`}
            </button>
            
            <div className="flex items-center gap-3 rounded-2xl bg-[#f6f7ff] px-4 py-3 text-xs text-gray-500">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#5a2dff] shadow-sm">
                <LockClosedIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-gray-900">{t('checkout.securityGuarantee.title')}</p>
                <p>{t('checkout.securityGuarantee.description')}</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </UserLayout>
  );
};

export default CheckoutPage;