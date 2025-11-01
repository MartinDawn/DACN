import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import UserLayout from "./layout/layout";
import { useCart } from "./hooks/useCart";
import { cartService } from "./services/cart.service"; // THAY ĐỔI 1: Import cartService

// Dữ liệu tĩnh giữ nguyên
type RecommendedCourse = {
  id: string;
  title: string;
  instructor: string;
  image: string;
  price: number;
  originalPrice?: number;
};
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
const paymentMethods = [
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

const MyCart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, loading, error, refreshCart } = useCart();

  const [selectedPayment, setSelectedPayment] = useState<string>(paymentMethods[0]?.value ?? "card");
  const [promoCode, setPromoCode] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null); // THAY ĐỔI 2: State để quản lý trạng thái xóa

  useEffect(() => {
    if (cart?.items) {
      setSelectedIds(cart.items.map((item) => item.id));
    }
  }, [cart]);

  const selectedCartItems = React.useMemo(
    () => (cart?.items ?? []).filter((item) => selectedIds.includes(item.id)),
    [cart, selectedIds]
  );

  // THAY ĐỔI 3: Cập nhật hàm handleRemove để gọi API
  const handleRemove = useCallback(async (id: string) => {
    setDeletingId(id); // Bắt đầu trạng thái đang xóa
    try {
        const response = await cartService.removeCourseFromCart(id);
        if (response.success) {
            refreshCart(); // Tải lại giỏ hàng để cập nhật UI
        } else {
            alert(`Lỗi: ${response.message || 'Không thể xóa khóa học.'}`);
        }
    } catch (err) {
        console.error("Lỗi khi xóa khóa học:", err);
        alert("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
    } finally {
        setDeletingId(null); // Kết thúc trạng thái đang xóa
    }
  }, [refreshCart]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);
  
  const handleAddRecommended = useCallback(async (course: RecommendedCourse) => {
      console.log(`Yêu cầu thêm sản phẩm ${course.id}. Cần triển khai API.`);
      // await cartService.addCourseToCart(course.id);
      refreshCart();
  }, [refreshCart]);

  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal;

  const handleCheckout = () => {
    navigate("/user/checkout");
  };

  if (loading) {
    return (
        <UserLayout>
            <div className="flex min-h-[60vh] items-center justify-center text-center">Đang tải giỏ hàng của bạn...</div>
        </UserLayout>
    );
  }
  
  if (error) {
      return (
          <UserLayout>
              <div className="flex min-h-[60vh] items-center justify-center text-center text-red-500">{error}</div>
          </UserLayout>
      );
  }

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
          <p className="text-sm text-gray-500">{cart?.totalItems ?? 0} khóa học trong giỏ hàng</p>
        </header>

        {cart && cart.items.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
              <section className="space-y-6">
                {cart.items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const detailPath = `/courses/${item.id}`;
                  const isDeleting = deletingId === item.id; // THAY ĐỔI 4: Biến kiểm tra đang xóa
                  
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
                            aria-label={`Chọn ${item.name}`}
                            className="mt-2 h-5 w-5 rounded border-gray-300 text-[#5a2dff] focus:ring-[#5a2dff]"
                          />
                          <Link
                            to={detailPath}
                            className="relative h-40 w-full overflow-hidden rounded-2xl md:w-48"
                          >
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          </Link>
                        </div>

                        <div className="flex flex-1 flex-col justify-between gap-4">
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <h2 className="text-lg font-semibold text-gray-900">
                                <Link to={detailPath} className="transition hover:text-[#5a2dff]">
                                  {item.name}
                                </Link>
                              </h2>
                              <p className="text-sm text-gray-500">bởi {item.instructorName}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-semibold text-[#5a2dff]">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-600">
                              <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 transition hover:border-[#5a2dff] hover:text-[#5a2dff]"
                              >
                                <HeartIcon className="h-4 w-4" />
                                Lưu để sau
                              </button>
                              {/* THAY ĐỔI 5: Cập nhật nút xóa */}
                              <button
                                type="button"
                                onClick={() => handleRemove(item.id)}
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-4 py-2 transition hover:border-red-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <TrashIcon className="h-4 w-4" />
                                {isDeleting ? "Đang xóa..." : "Xóa"}
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
                      <span>Tổng phụ ({selectedCartItems.length} khóa học)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
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
                </div>

                <div className="rounded-3xl bg-white p-6 shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
                  <h3 className="text-lg font-semibold text-gray-900">Thanh toán an toàn</h3>
                  <div className="mt-4 space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          selectedPayment === method.value
                            ? "border-[#5a2dff] bg-[#f4f0ff] text-[#5a2dff]"
                            : "border-gray-200 text-gray-600 hover:border-[#5a2dff]/60 hover:text-[#5a2dff]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={selectedPayment === method.value}
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
                    ))}
                  </div>
                </div>

              </aside>
            </div>
        ) : (
            <div className="text-center p-12 border-2 border-dashed rounded-3xl">
                <h2 className="text-xl font-semibold">Giỏ hàng của bạn đang trống</h2>
                <p className="mt-2 text-gray-500">Có vẻ như bạn chưa thêm khóa học nào vào giỏ hàng.</p>
                <Link to="/courses" className="mt-6 inline-block rounded-full bg-[#5a2dff] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4a21eb]">
                    Khám phá các khóa học
                </Link>
            </div>
        )}
      </div>
    </UserLayout>
  );
};

export default MyCart;