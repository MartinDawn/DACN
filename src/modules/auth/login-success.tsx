import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

const LoginSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { getProfile } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken') || params.get('access_token') || params.get('token');

    if (accessToken) {
      (async () => {
        try {
          // Lưu token
          localStorage.setItem('accessToken', accessToken);

          // Lấy profile
          const profileRes = await getProfile(accessToken);
          if (profileRes?.success && profileRes.data) {
            if (profileRes.data.role === 'Admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/user/home');
            }
          } else {
            // If profile fails, still set a default user
            localStorage.setItem('user', JSON.stringify({ role: 'Student' }));
            navigate('/user/home');
          }
        } catch (err) {
          console.error(err);
          navigate('/login');
        }
      })();
    } else {
      navigate('/login');
    }
  }, [navigate, getProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default LoginSuccess;