import React, { useState } from 'react';
import { AuthNotification } from './AuthNotification';
import { OTPInput } from './OTPInput';

interface OTPVerificationProps {
  email: string;
  onVerified: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading?: boolean;
  apiError?: string | null;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onVerified,
  onResend,
  isLoading = false,
  apiError = null,
}) => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  // Xử lý đếm ngược để gửi lại OTP
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Xử lý khi OTP được điền đầy đủ
  const handleOTPComplete = async (completedOTP: string) => {
    setOtp(completedOTP);
    try {
      await onVerified(completedOTP);
    } catch (error) {
      // Lỗi sẽ được xử lý ở component cha
      console.error('OTP verification failed:', error);
    }
  };

  // Xử lý gửi lại OTP
  const handleResendOTP = async () => {
    try {
      await onResend();
      setNotification({
        show: true,
        type: 'success',
        message: 'Mã OTP mới đã được gửi đến email của bạn'
      });
      setCountdown(30); // Reset countdown
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Không thể gửi lại mã OTP. Vui lòng thử lại sau.'
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      <AuthNotification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Xác thực email
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Vui lòng nhập mã OTP đã được gửi đến
          <br />
          <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>

      <OTPInput
        length={6}
        value={otp}
        onChange={setOtp}
        onComplete={handleOTPComplete}
        loading={isLoading}
        error={!!apiError}
        autoFocus
      />

      {apiError && (
        <p className="text-center text-sm text-red-500">
          {apiError}
        </p>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-500">
          {countdown > 0 ? (
            <>
              Gửi lại mã sau{' '}
              <span className="font-medium text-gray-900">
                {countdown}s
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="font-semibold text-indigo-500 hover:text-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Gửi lại mã OTP
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;