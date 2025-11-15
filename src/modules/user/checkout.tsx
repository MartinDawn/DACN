import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";

// 1. IMPORT CẢ HAI HOOK
import { useCart } from "./hooks/useCart";
import { useUserProfileData } from "../avatar_info/hooks/useUserProfile"; // Đảm bảo đường dẫn đúng

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const paymentMethods = [
  // ... (Giữ nguyên)
  {
    value: "card",
    label: "Thẻ tín dụng/ghi nợ",
    description: "Visa, Mastercard, JCB",
    Icon: CreditCardIcon,
  },
  {
    value: "bank",
    label: "Mobile Banking",
    description: "Vietcombank, Techcombank, BIDV",
    Icon: BuildingLibraryIcon,
  },
  {
    value: "wallet",
    label: "Ví điện tử",
    description: "MoMo, ZaloPay, ShopeePay",
    Icon: DevicePhoneMobileIcon,
  },
];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 2. LẤY DỮ LIỆU TỪ CẢ HAI HOOK
  const { cart, loading: isCartLoading, error: cartError } = useCart();
  const { 
    profileData, 
    isLoading: isProfileLoading, 
    fetchProfile // Lấy hàm fetch
  } = useUserProfileData();
  
  const selectedItems = useMemo(() => cart?.items ?? [], [cart]);

  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].value);
  const [agreed, setAgreed] = useState(false);
  
  // 3. Khởi tạo state form rỗng (hoặc với giá trị mặc định)
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

  // 4. GỌI API FETCH PROFILE KHI TRANG TẢI
  useEffect(() => {
    fetchProfile();
    // (useCart đã tự fetch)
  }, [fetchProfile]);

  // 5. DÙNG useEffect ĐỂ ĐIỀN FORM KHI `profileData` CÓ
  useEffect(() => {
    if (profileData) {
      setForm((prev) => ({
        ...prev,
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        phone: profileData.phoneNumber || "",
        city: profileData.location || "",
        cardName: profileData.fullName.toUpperCase() || "", // Tự điền tên thẻ
      }));
    }
  }, [profileData]); // Chạy lại khi profileData thay đổi

  // ... (Tính toán subtotal, discount, total giữ nguyên) ...
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const discount = 0; 
  const priceAfterDiscount = subtotal - discount;
  const vat = Math.round(priceAfterDiscount * 0.08); 
  const total = priceAfterDiscount + vat;

  const handleChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agreed) return;
    
    // Xử lý logic thanh toán API ở đây...
    
    alert("Thanh toán thành công!");
    navigate("/user/mycourses"); 
  };

  const isCardMethod = paymentMethod === "card";

  // 6. GỘP STATE LOADING/ERROR
  const isLoading = isCartLoading || isProfileLoading;
  const apiError = cartError || (profileData === null && !isProfileLoading ? "Không tải được profile" : null); // (Giả sử hook profile trả về null nếu lỗi)

  if (isLoading) {
    return (
      <UserLayout>
        <div className="text-center">Đang tải thông tin thanh toán...</div>
      </UserLayout>
    );
  }
  
  if (apiError) {
    return (
      <UserLayout>
        <div className="text-center text-red-500">{apiError}</div>
      </UserLayout>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <UserLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg font-semibold">Không có khóa học nào trong giỏ hàng.</p>
          <Link to="/courses" className="rounded-full bg-[#5a2dff] px-5 py-2 text-sm font-semibold text-white">
            Khám phá khóa học
          </Link>
        </div>
      </UserLayout>
    );
  }

  // 7. PHẦN JSX (FORM) GIỜ SẼ ĐƯỢC TỰ ĐỘNG ĐIỀN
  return (
    <UserLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <Link
            to="/user/cart"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại giỏ hàng
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Thanh toán đơn hàng</h2>
          <p className="mt-1 text-sm text-gray-500">
            Hoàn tất thông tin để truy cập toàn bộ nội dung khóa học chỉ với vài bước.
          </p>
        </header>

        <form className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]" onSubmit={handleSubmit}>
          <section className="space-y-8">
            {/* Thông tin thanh toán (Sẽ được tự điền) */}
            <div className="rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin thanh toán</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-gray-600">
                  Họ và tên *
                  <input
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                    placeholder="Nhập họ và tên"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-gray-600">
                  Email *
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                    placeholder="Nhập email"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-gray-600">
                  Số điện thoại *
                  <input
                    value={form.phone}
                    onChange={handleChange("phone")}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                    placeholder="0123456789"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-semibold text-gray-600">
                  Tỉnh/Thành phố *
                  <input
                    value={form.city}
                    onChange={handleChange("city")}
                    className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10"
                    placeholder="Nhập tỉnh/thành phố"
                    required
                  />
                </label>
              </div>
            </div>

            {/* Phương thức thanh toán (Giữ nguyên) */}
            <div className="rounded-3xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h3>
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
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#5a2dff]">
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

              {/* Chi tiết thẻ (Tự điền tên) */}
              <div className={`mt-6 grid gap-4 rounded-2xl bg-[#f8f8ff] p-5 ${!isCardMethod ? 'opacity-50' : ''}`}>
                <h4 className="text-sm font-semibold text-gray-900">Chi tiết thẻ</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                   <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                     Số thẻ *
                     <input
                       value={form.cardNumber}
                       onChange={handleChange("cardNumber")}
                       className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10 disabled:bg-gray-100"
                       placeholder="1234 5678 9012 3456"
                       disabled={!isCardMethod}
                       required={isCardMethod}
                     />
                   </label>
                   <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                     Tên trên thẻ *
                     <input
                      //  value={form.cardName}  
                       onChange={handleChange("cardName")}
                       className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10 disabled:bg-gray-100"
                       placeholder="NGUYEN VAN A"
                       disabled={!isCardMethod}
                       required={isCardMethod}
                     />
                   </label>
                   <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                     Ngày hết hạn *
                     <input
                       value={form.expiry}
                       onChange={handleChange("expiry")}
                       className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10 disabled:bg-gray-100"
                       placeholder="MM/YY"
                       disabled={!isCardMethod}
                       required={isCardMethod}
                     />
                   </label>
                   <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                     CVV *
                     <input
                       value={form.cvv}
                       onChange={handleChange("cvv")}
                       className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-[#5a2dff] focus:ring-2 focus:ring-[#5a2dff]/10 disabled:bg-gray-100"
                       placeholder="123"
                       disabled={!isCardMethod}
                       required={isCardMethod}
                     />
                   </label>
                </div>
                <p className="text-xs text-gray-500">
                  Thông tin thanh toán của bạn được mã hóa SSL 256-bit.
                </p>
              </div>
            </div>
          </section>

          {/* Sidebar tóm tắt đơn hàng (Giữ nguyên) */}
          <aside className="space-y-6 rounded-3xl border border-gray-100 p-6 shadow-sm lg:sticky lg:top-28">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Tóm tắt đơn hàng</h3>
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <img src={item.imageUrl} alt={item.name} className="h-16 w-24 rounded-lg object-cover" />
                  <div className="flex-1 space-y-1 text-sm">
                    <h4 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-gray-800">{currencyFormatter.format(item.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-[#f7f7fb] p-4 text-sm text-gray-600">
             {/* ... (Phần "Bạn sẽ nhận được" giữ nguyên) ... */}
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Bạn sẽ nhận được</h4>
              <ul className="mt-3 space-y-2">
                {["Truy cập trọn đời vào khóa học", "Chứng chỉ hoàn thành", "Hỗ trợ từ giảng viên", "Tài liệu tham khảo"].map(
                  (benefit) => (
                    <li key={benefit} className="flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                      <span>{benefit}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="space-y-3 text-sm">
              <div className="space-y-2 text-gray-500">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-900">{currencyFormatter.format(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Giảm giá</span>
                    <span>- {currencyFormatter.format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Thuế (8%)</span>
                  <span>{currencyFormatter.format(vat)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Tổng cộng</span>
                <span className="text-[#5a2dff]">{currencyFormatter.format(total)}</span>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#5a2dff] focus:ring-[#5a2dff]"
              />
              <span>
                Tôi đồng ý với{" "}
                <button type="button" className="font-semibold text-[#5a2dff]">
                  Điều khoản sử dụng
                </button>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={!agreed}
              className={`w-full rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
                agreed ? "bg-[#5a2dff] hover:bg-[#3c1cd6]" : "cursor-not-allowed bg-[#b9a8ff]"
              }`}
            >
              Hoàn tất thanh toán {currencyFormatter.format(total)}
            </button>
            
            <div className="flex items-center gap-3 rounded-2xl bg-[#f6f7ff] px-4 py-3 text-xs text-gray-500">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <LockClosedIcon className="h-4 w-4 text-[#5a2dff]" />
              </span>
              <div>
                <p className="font-semibold text-gray-900">Bảo mật thanh toán</p>
                <p>Đảm bảo hoàn tiền trong 30 ngày nếu bạn không hài lòng.</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </UserLayout>
  );
};

export default CheckoutPage;