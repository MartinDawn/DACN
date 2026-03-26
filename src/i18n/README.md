# Internationalization (i18n) Implementation

Hệ thống đa ngôn ngữ đã được implement sử dụng `react-i18next`. Hỗ trợ ngôn ngữ tiếng Việt (vi) và tiếng Anh (en).

## Cấu trúc files

```
public/
└── locales/
    ├── vi.json              # Translation cho tiếng Việt
    └── en.json              # Translation cho tiếng Anh
src/
├── i18n/
│   ├── index.ts             # Cấu hình i18n với HTTP backend
│   └── README.md            # Documentation này
├── contexts/
│   └── LanguageContext.tsx  # Provider để quản lý language state
└── components/
    └── LanguageSwitcher.tsx # Component chuyển đổi ngôn ngữ
```

## Cách sử dụng

### 1. Sử dụng translations trong component

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('navigation.home')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
};
```

### 2. Sử dụng LanguageSwitcher component

```tsx
import { LanguageSwitcher } from './components/LanguageSwitcher';

const Navbar = () => {
  return (
    <nav>
      {/* Other nav items */}
      <LanguageSwitcher />
    </nav>
  );
};
```

### 3. Truy cập language context

```tsx
import { useLanguage } from './contexts/LanguageContext';

const MyComponent = () => {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();

  const handleChangeToEnglish = () => {
    changeLanguage('en');
  };

  return (
    <div>
      <span>Current language: {currentLanguage}</span>
      <button onClick={handleChangeToEnglish} disabled={isLoading}>
        Change to English
      </button>
    </div>
  );
};
```

## API Integration

### Accept-Language Header

API client sẽ tự động gửi `Accept-Language` header dựa trên ngôn ngữ hiện tại:

- Khi user chọn tiếng Việt: `Accept-Language: vi`
- Khi user chọn tiếng Anh: `Accept-Language: en`

Header này được cập nhật tự động khi user thay đổi ngôn ngữ.

### Ví dụ API call

```tsx
// API sẽ tự động gửi Accept-Language header
const response = await apiClient.get('/courses');
// Server sẽ return data theo ngôn ngữ đã chọn
```

## Thêm translations mới

### 1. Thêm vào file public/locales/vi.json

```json
{
  "newSection": {
    "title": "Tiêu đề mới",
    "description": "Mô tả mới"
  }
}
```

### 2. Thêm vào file public/locales/en.json

```json
{
  "newSection": {
    "title": "New Title",
    "description": "New Description"
  }
}
```

### 3. Sử dụng trong component

```tsx
const { t } = useTranslation();
return <h1>{t('newSection.title')}</h1>;
```

## Storage

- Ngôn ngữ được lưu trong `localStorage` với key `language`
- Khi reload trang, ứng dụng sẽ sử dụng ngôn ngữ đã lưu
- Default language là tiếng Việt (`vi`)

## Components đã được cập nhật

1. **Navbar**:
   - Thêm LanguageSwitcher
   - Sử dụng translations cho menu items
   - Profile menu được localized

2. **Login Page**:
   - Form labels và placeholders
   - Error messages
   - Button text
   - Navigation links

## Notes

- Translations được load trong `main.tsx` trước khi render app
- LanguageProvider được wrap bên ngoài toàn bộ ứng dụng
- API client được cập nhật tự động khi thay đổi ngôn ngữ
- Component sẽ re-render khi ngôn ngữ thay đổi nhờ vào context

## Performance

- Translations được load từ HTTP backend (public/locales/)
- Files được serve như static assets bởi Vite dev server
- Language changes sẽ load resources mới nếu chưa được cache
- Sử dụng localStorage để cache language preference