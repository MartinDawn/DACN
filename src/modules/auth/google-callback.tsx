import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { exchangeGoogleCode, loading, error } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const accessToken = params.get("access_token") || params.get("token");

      if (accessToken) {
        // Some providers may return token directly to frontend — persist & fetch profile
        try {
          localStorage.setItem("accessToken", accessToken);
        } catch (e) {}
        // let useAuth.getProfile in another flow handle fetch; redirect now
        navigate("/user/home");
        return;
      }

      if (!code) {
        setMessage("Không tìm thấy code trả về từ Google.");
        return;
      }

      try {
        const res = await exchangeGoogleCode(code, state || undefined);
        if (res && res.profile && res.profile.success) {
          navigate("/user/home");
        } else {
          setMessage(res?.exchange?.message || res?.profile?.message || "Xác thực Google thất bại.");
        }
      } catch (err: any) {
        setMessage(err?.message || "Lỗi khi hoàn tất đăng nhập Google.");
      }
    })();
  }, [exchangeGoogleCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow">
        <h2 className="text-xl font-semibold mb-4">Đang xử lý đăng nhập bằng Google...</h2>
        {loading && <p>Vui lòng chờ...</p>}
        {!loading && message && (
          <div className="text-red-600">
            <p>{message}</p>
            <p className="mt-2 text-sm text-gray-500">
              Nếu bạn nhìn thấy lỗi "localhost refused to connect" sau khi Google chuyển hướng,
              vui lòng đảm bảo backend OAuth (API) đang chạy và endpoint /Account/google-callback hoạt động.
            </p>
          </div>
        )}
        {!loading && !message && !error && <p>Nếu trình duyệt không tự động chuyển hướng, hãy đợi hoặc thử làm mới trang.</p>}
        {!loading && error && <div className="text-red-600">{error}</div>}
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
