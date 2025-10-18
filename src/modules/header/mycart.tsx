import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ClockIcon,
  HeartIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import UserLayout from "../user/layout/layout";

type CartItem = {
  id: string;
  title: string;
  instructor: string;
  image: string;
  duration: string;
  students: string;
  rating: number;
  ratingCount: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  tag?: string;
};

type RecommendedCourse = {
  id: string;
  title: string;
  instructor: string;
  image: string;
  price: number;
  originalPrice?: number;
};

type PaymentMethod = {
  value: string;
  label: string;
  description?: string;
};

const CART_STORAGE_KEY = "eduviet_cart";

const defaultCartItems: CartItem[] = [
  {
    id: "react-complete",
    title: "Khóa học React Chuyên sâu 2024",
    instructor: "John Smith",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    duration: "25 giờ",
    students: "15.420 học viên",
    rating: 4.8,
    ratingCount: "1.234",
    price: 999_000,
    originalPrice: 1_999_000,
    discountPercent: 50,
    tag: "Bán chạy",
  },
  {
    id: "js-mastery",
    title: "JavaScript Mastery Hoàn Chỉnh",
    instructor: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    duration: "18 giờ",
    students: "8.930 học viên",
    rating: 4.6,
    ratingCount: "892",
    price: 799_000,
    originalPrice: 1_499_000,
    discountPercent: 47,
  },
  {
    id: "node-backend",
    title: "Node.js Backend Development",
    instructor: "Mike Chen",
    image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=900&q=80",
    duration: "22 giờ",
    students: "6.750 học viên",
    rating: 4.7,
    ratingCount: "543",
    price: 889_000,
    originalPrice: 1_799_000,
    discountPercent: 50,
  },
];

const recommendedCourses: RecommendedCourse[] = [
  {
    id: "css-sass",
    title: "Chuyên sâu CSS và Sass",
    instructor: "Emma Davis",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    price: 549_000,
    originalPrice: 899_000,
  },
  {
    id: "mongodb",
    title: "MongoDB Database Course",
    instructor: "Alex Wilson",
    image: "https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=900&q=80",
    price: 629_000,
    originalPrice: 1_099_000,
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    value: "card",
    label: "Thẻ tín dụng/ghi nợ",
    description: "Hỗ trợ Visa, MasterCard, JCB",
  },
  {
    value: "paypal",
    label: "PayPal",
    description: "Thanh toán nhanh qua tài khoản PayPal",
  },
  {
    value: "gift",
    label: "Thẻ quà tặng",
    description: "Sử dụng mã thẻ quà tặng EDUViet",
  },
];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const loadCartItems = (): CartItem[] => {
  if (typeof window === "undefined") return defaultCartItems;
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length ? parsed : defaultCartItems;
  } catch {
    return defaultCartItems;
  }
};

const persistCartItems = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const MyCart: React.FC = () => {
  const [cartItems, setCartItems] = React.useState<CartItem[]>(() => loadCartItems());
  const [selectedPayment, setSelectedPayment] = React.useState<string>(paymentMethods[0]?.value ?? "card");
  const [promoCode, setPromoCode] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>(() => loadCartItems().map((item) => item.id));
  const navigate = useNavigate();

  React.useEffect(() => {
    persistCartItems(cartItems);
  }, [cartItems]);

  React.useEffect(() => {
    setSelectedIds((prev) => {
      const available = cartItems.map((item) => item.id);
      const retained = prev.filter((id) => available.includes(id));
      const newlyAdded = available.filter((id) => !retained.includes(id));
      return [...retained, ...newlyAdded];
    });
  }, [cartItems]);

  const selectedCartItems = React.useMemo(
    () => cartItems.filter((item) => selectedIds.includes(item.id)),
    [cartItems, selectedIds]
  );

  const handleRemove = React.useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleToggleSelect = React.useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  }, []);

  const handleAddRecommended = React.useCallback((course: RecommendedCourse) => {
    setCartItems((prev) => {
      if (prev.some((item) => item.id === course.id)) return prev;
      const discountPercent =
        course.originalPrice && course.originalPrice > 0
          ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
          : undefined;
      return [
        ...prev,
        {
          id: course.id,
          title: course.title,
          instructor: course.instructor,
          image: course.image,
          duration: "—",
          students: "—",
          rating: 0,
          ratingCount: "0",
          price: course.price,
          originalPrice: course.originalPrice,
          discountPercent,
        },
      ];
    });
  }, []);

  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price, 0);
  const savings = selectedCartItems.reduce((sum, item) => {
    if (!item.originalPrice) return sum;
    return sum + (item.originalPrice - item.price);
  }, 0);
  const total = subtotal;

  const handleCheckout = () => {
    navigate("/user/checkout");
  };

  return (
    <UserLayout>
      <div className="space-y-8">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a2dff] transition hover:text-[#3c1cd6]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Tiếp tục mua sắm
        </Link>

        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
          <p className="text-sm text-gray-500">{cartItems.length} khóa học trong giỏ hàng</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
          <section className="space-y-6">
            {cartItems.map((item) => {
              const discountLabel = item.discountPercent ? `${item.discountPercent}% giảm` : null;
              const savingsLabel =
                item.originalPrice != null ? formatCurrency(item.originalPrice - item.price) : null;
              const isSelected = selectedIds.includes(item.id);
              const detailPath = `/courses/${item.id}`;
              return (
                <article
                  key={item.id}
                  className={`rounded-3xl border ${isSelected ? "border-[#5a2dff]" : "border-gray-100"} bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]`}
                >
                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        aria-label={`Chọn ${item.title}`}
                        className="mt-2 h-5 w-5 rounded border-gray-300 text-[#5a2dff] focus:ring-[#5a2dff]"
                      />
                      <Link
                        to={detailPath}
                        className="relative h-40 w-full overflow-hidden rounded-2xl md:w-48"
                      >
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                        {item.tag && (
                          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[#efe7ff] px-3 py-1 text-xs font-semibold text-[#5a2dff]">
                            {item.tag}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="flex flex-1 flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold text-gray-900">
                            <Link to={detailPath} className="transition hover:text-[#5a2dff]">
                              {item.title}
                            </Link>
                          </h2>
                          <p className="text-sm text-gray-500">bởi {item.instructor}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <ClockIcon className="h-5 w-5" />
                            {item.duration}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UserGroupIcon className="h-5 w-5" />
                            {item.students}
                          </span>
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <StarIcon className="h-5 w-5 text-amber-400" />
                            <span className="font-semibold text-gray-900">{item.rating.toFixed(1)}</span>
                            <span className="text-gray-400">({item.ratingCount} đánh giá)</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-semibold text-[#5a2dff]">
                            {formatCurrency(item.price)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(item.originalPrice)}
                            </span>
                          )}
                          {discountLabel && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                              {discountLabel}
                            </span>
                          )}
                          {savingsLabel && (
                            <span className="text-xs font-semibold text-emerald-500">
                              Tiết kiệm {savingsLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-600">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                          >
                            <HeartIcon className="h-4 w-4" />
                            Lưu để sau
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 transition hover:border-red-400 hover:text-red-500"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">
                Học viên mua khóa này cũng mua
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {recommendedCourses.map((course) => (
                  <article
                    key={course.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-[#5a2dff]"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-20 w-28 rounded-xl object-cover"
                      />
                      <div className="space-y-1 text-sm">
                        <h4 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h4>
                        <p className="text-xs text-gray-500">bởi {course.instructor}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-semibold text-[#5a2dff]">
                            {formatCurrency(course.price)}
                          </span>
                          {course.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              {formatCurrency(course.originalPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddRecommended(course)}
                      className="w-full rounded-full bg-[#05001a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e0b63]"
                    >
                      Thêm vào giỏ
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-500">
                  <span>Tổng phụ ({selectedCartItems.length} khóa học đã chọn)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex items-center justify-between text-emerald-500">
                    <span>Tiết kiệm</span>
                    <span className="font-semibold">- {formatCurrency(savings)}</span>
                  </div>
                )}
              </div>
              <div className="my-4 h-px bg-gray-100" />
              <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
                <span>Tổng cộng</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={selectedCartItems.length === 0}
                className={`mt-6 w-full rounded-full px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(90,45,255,0.35)] transition ${
                  selectedCartItems.length === 0
                    ? "cursor-not-allowed bg-[#5a2dff]/60"
                    : "bg-[#5a2dff] hover:bg-[#4a21eb]"
                }`}
              >
                Thanh toán
              </button>
              <p className="mt-2 text-center text-xs text-gray-400">
                Thanh toán được bảo vệ bằng mã hóa 256-bit
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">Mã giảm giá</h3>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  placeholder="Nhập mã giảm giá"
                  className="h-11 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-600 outline-none transition focus:border-[#5a2dff] focus:bg-white"
                />
                <button
                  type="button"
                  className="h-11 rounded-full border border-[#5a2dff] px-5 text-sm font-semibold text-[#5a2dff] transition hover:bg-[#efe7ff]"
                >
                  Áp dụng
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Gợi ý: sử dụng mã <span className="font-semibold text-[#5a2dff]">SAVE20</span> để giảm thêm 20%
              </p>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900">Thanh toán an toàn</h3>
              <div className="mt-4 space-y-3">
                {paymentMethods.map((method) => {
                  const isActive = selectedPayment === method.value;
                  return (
                    <label
                      key={method.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "border-[#5a2dff] bg-[#f4f0ff] text-[#5a2dff]"
                          : "border-gray-200 text-gray-600 hover:border-[#5a2dff]/60 hover:text-[#5a2dff]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={isActive}
                        onChange={() => setSelectedPayment(method.value)}
                        className="h-4 w-4 text-[#5a2dff]"
                      />
                      <div>
                        <span>{method.label}</span>
                        {method.description && (
                          <p className="text-xs font-normal text-gray-400">{method.description}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-700">
              <div className="flex items-center gap-3 text-emerald-700">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <ShieldCheckIcon className="h-6 w-6" />
                </span>
                <div>
                  <h4 className="text-base font-semibold">Cam kết hoàn tiền trong 30 ngày</h4>
                  <p>Hoàn tiền toàn bộ nếu bạn không hài lòng với khóa học.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </UserLayout>
  );
};

export default MyCart;
