import React, { useState, useRef, useEffect } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete?: (otp: string) => void;
  autoFocus?: boolean;
  loading?: boolean;
  error?: boolean;
  value?: string;
  onChange?: (otp: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  autoFocus = true,
  loading = false,
  error = false,
  value = '',
  onChange,
}) => {
  const [otp, setOtp] = useState<string[]>(value.split('').slice(0, length));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value) {
      setOtp(value.split('').slice(0, length));
    }
  }, [value, length]);

  const handleChange = (index: number, value: string) => {
    // Chỉ cho phép nhập số
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Chỉ lấy ký tự cuối cùng nếu user paste nhiều số
    setOtp(newOtp);

    // Thông báo sự thay đổi
    const otpString = newOtp.join('');
    onChange?.(otpString);

    // Di chuyển đến ô tiếp theo nếu có nhập giá trị
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Kiểm tra xem đã nhập đủ số chưa
    if (newOtp.filter(Boolean).length === length) {
      onComplete?.(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Xử lý phím Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      if (newOtp[index]) {
        // Nếu ô hiện tại có giá trị, xóa giá trị đó
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      } else if (index > 0) {
        // Nếu ô hiện tại trống, di chuyển về ô trước và xóa giá trị của ô đó
        inputRefs.current[index - 1]?.focus();
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      }
    }
    // Xử lý phím mũi tên
    else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    if (!/^\d*$/.test(pastedData)) return; // Chỉ cho phép paste số

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < length) newOtp[i] = char;
    });
    setOtp(newOtp);
    onChange?.(newOtp.join(''));

    // Focus vào ô cuối cùng được paste
    const lastIndex = Math.min(pastedData.length - 1, length - 1);
    inputRefs.current[lastIndex]?.focus();

    if (newOtp.filter(Boolean).length === length) {
      onComplete?.(newOtp.join(''));
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array(length).fill(null).map((_, index) => (
        <input
          key={index}
          ref={el => { inputRefs.current[index] = el }}
          type="text"
          maxLength={1}
          value={otp[index] || ''}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={loading}
          className={`
            w-12 h-14 text-center text-2xl font-semibold rounded-xl
            border-2 outline-none transition-all
            ${error 
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' 
              : 'border-gray-200 bg-gray-50 focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'
            }
            ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-300'}
          `}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;