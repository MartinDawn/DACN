import React from "react";
import {
  XMarkIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

type CheckoutCourse = {
  title: string;
  price: string;
  originalPrice?: string;
  image: string;
  instructor?: { name?: string };
  duration?: string;
  rating?: number;
  ratingCount?: string;
};

type CheckoutModalProps = {
  course: CheckoutCourse;
  onClose: () => void;
  onProceed: () => void;
};

const parseCurrencyToNumber = (value?: string) => (value ? Number(value.replace(/[^\d]/g, "")) || 0 : 0);

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const paymentMethods = [
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

const CheckoutModal: React.FC<CheckoutModalProps> = ({ course, onClose, onProceed }) => {
  const [paymentMethod, setPaymentMethod] = React.useState(paymentMethods[0].value);
  const [agreed, setAgreed] = React.useState(false);
  const [form, setForm] = React.useState({
    fullName: "Nguyễn Văn A",
    email: "email@example.com",
    phone: "0123456789",
    city: "Hồ Chí Minh",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "NGUYEN VAN A",
  });

  const priceValue = parseCurrencyToNumber(course.price);
  const originalValue = parseCurrencyToNumber(course.originalPrice);
  const subtotal = originalValue > 0 ? originalValue : priceValue;
  const discount = originalValue > priceValue ? originalValue - priceValue : 0;
  const vat = Math.round(priceValue * 0.1);
  const total = priceValue + vat;

  const handleChange = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!agreed) return;
    onProceed();
  };

  const isCardMethod = paymentMethod === "card";

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10">
      <div className="w-full max-w-5xl space-y-8 rounded-[32px] bg-white p-8 shadow-2xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#5a2dff]">Thanh toán khóa học</p>
            <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Hoàn tất thông tin để truy cập toàn bộ nội dung khóa học chỉ với vài bước.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-100"
            aria-label="Đóng"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </header>

        <form className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]" onSubmit={handleSubmit}>
          <section className="space-y-8">
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

              <div className="mt-6 grid gap-4 rounded-2xl bg-[#f8f8ff] p-5">
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
                      value={form.cardName}
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
                  Thông tin thanh toán của bạn được mã hóa SSL 256-bit và không được lưu trữ trên hệ thống của chúng tôi.
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-6 rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <img src={course.image} alt={course.title} className="h-20 w-28 rounded-xl object-cover" />
              <div className="space-y-1 text-sm">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-500">
                  {course.instructor?.name ?? "Giảng viên"} • {course.duration ?? "—"}
                </p>
                {course.rating && (
                  <p className="text-xs text-gray-500">
                    Đánh giá: <span className="font-semibold text-gray-900">{course.rating.toFixed(1)}</span>
                    {course.ratingCount ? ` (${course.ratingCount} đánh giá)` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-[#f7f7fb] p-4 text-sm text-gray-600">
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
              <label className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-gray-600">
                <input type="text" placeholder="Nhập mã giảm giá" className="flex-1 bg-transparent outline-none" />
                <button type="button" className="text-sm font-semibold text-[#5a2dff] transition hover:opacity-80">
                  Áp dụng
                </button>
              </label>

              <div className="space-y-2 text-gray-500">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-900">{currencyFormatter.format(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-500">
                    <span>Giảm giá khóa học</span>
                    <span>- {currencyFormatter.format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Thuế VAT (10%)</span>
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
                </button>{" "}
                và{" "}
                <button type="button" className="font-semibold text-[#5a2dff]">
                  Chính sách bảo mật
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
                <p>Đảm bảo hoàn tiền trong 30 ngày nếu bạn không hài lòng với khóa học.</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
