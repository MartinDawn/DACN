# Multi-Language API Integration Guide

Hướng dẫn này giải thích cách hệ thống xử lý đa ngôn ngữ cho API data trong ứng dụng.

## 🔧 Cách hoạt động

### 1. **API Client Configuration**
File: `src/modules/auth/services/apiClient.ts`

- **Accept-Language Header**: Được gửi tự động với mỗi request
- **Dynamic Update**: Header được cập nhật thông qua request interceptor
- **Language Detection**: Lấy ngôn ngữ hiện tại từ localStorage

```typescript
// Header được tự động cập nhật cho mỗi request
config.headers['Accept-Language'] = getCurrentLanguage();
```

### 2. **Language Context**
File: `src/contexts/LanguageContext.tsx`

- **Callback System**: Cho phép đăng ký callbacks khi ngôn ngữ thay đổi
- **Auto Refresh**: Tự động gọi các callbacks để refresh data

```typescript
// Register callback để refresh data khi ngôn ngữ thay đổi
const unsubscribe = onLanguageChange(() => {
  refreshDataFunction();
});
```

### 3. **Auto Refresh Hook**
File: `src/hooks/useRefreshOnLanguageChange.ts`

```typescript
import { useRefreshOnLanguageChange } from '@/hooks/useRefreshOnLanguageChange';

// Tự động refresh data khi đổi ngôn ngữ
useRefreshOnLanguageChange(() => {
  fetchDataFunction();
}, [dependencies]);
```

## 📝 Cách sử dụng trong Components

### Ví dụ 1: Sử dụng với existing hooks
```typescript
// Trong component
const MyComponent = () => {
  const { getRecommendedCourses, recommendedCourses } = useCourses();

  useEffect(() => {
    getRecommendedCourses();
  }, [getRecommendedCourses]);

  // Hook đã tự động tích hợp refresh on language change
  // Không cần thêm code gì!

  return <div>{/* render courses */}</div>;
};
```

### Ví dụ 2: Tạo custom refresh logic
```typescript
const MyComponent = () => {
  const [data, setData] = useState([]);

  const fetchData = useCallback(async () => {
    const response = await apiClient.get('/my-endpoint');
    setData(response.data);
  }, []);

  // Auto refresh khi đổi ngôn ngữ
  useRefreshOnLanguageChange(fetchData);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <div>{/* render data */}</div>;
};
```

## 🎯 Hooks đã được tích hợp sẵn

### `useCourses`
File: `src/modules/course/hooks/useCourses.ts`

**Tự động refresh khi đổi ngôn ngữ:**
- ✅ `getRecommendedCourses()`
- ✅ `getMyCourses()`
- ✅ `getCourseDetail()`
- ✅ `getCourseComments()`

### Cách tích hợp vào hooks khác

```typescript
export const useMyCustomHook = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Track loaded data
  const loadedDataTracker = useRef({
    dataLoaded: false,
    currentId: null as string | null
  });

  const fetchData = useCallback(async (id?: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(\`/data\${id ? \`/\${id}\` : ''}\`);
      setData(response.data);

      // Track what was loaded
      loadedDataTracker.current.dataLoaded = true;
      if (id) loadedDataTracker.current.currentId = id;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto refresh on language change
  useRefreshOnLanguageChange(() => {
    const tracker = loadedDataTracker.current;

    if (tracker.dataLoaded) {
      fetchData(tracker.currentId || undefined);
    }
  });

  return { data, isLoading, fetchData };
};
```

## 🔧 Backend Requirements

Đảm bảo API backend xử lý header `Accept-Language`:

```csharp
// Ví dụ trong C# Controller
[HttpGet]
public async Task<IActionResult> GetCourses()
{
    var language = Request.Headers["Accept-Language"].FirstOrDefault() ?? "vi";
    var courses = await courseService.GetCourses(language);
    return Ok(courses);
}
```

## 📱 UI Language Switcher

File: `src/modules/header/navbar.tsx`

```typescript
// Khi click vào option ngôn ngữ
const handleLanguageSelect = (langCode: 'vi' | 'en') => {
  changeLanguage(langCode); // Tự động trigger refresh cho tất cả data
  setLanguageOpen(false);
};
```

## ✅ Best Practices

1. **Always track loaded data** - Sử dụng ref để theo dõi data nào đã được load
2. **Use callbacks** - Đăng ký callbacks với `onLanguageChange` để refresh data
3. **Handle loading states** - Đảm bảo UI không bị flicker khi refresh
4. **Error handling** - Xử lý lỗi khi refresh data
5. **Performance** - Chỉ refresh data thực sự cần thiết

## 🚫 Tránh những lỗi phổ biến

❌ **Không làm:** Manually refresh tất cả data
```typescript
// Tránh cách này
const handleLanguageChange = () => {
  fetchAllData(); // Quá tốn resources
};
```

✅ **Nên làm:** Chỉ refresh data đã được load
```typescript
// Sử dụng useRefreshOnLanguageChange hook
useRefreshOnLanguageChange(() => {
  if (hasLoadedData) {
    fetchSpecificData();
  }
});
```

---

## 📞 Hỗ trợ

Nếu có vấn đề với multi-language API integration, kiểm tra:

1. ✅ Request có header `Accept-Language` không?
2. ✅ Backend có xử lý header này không?
3. ✅ Hook có được register với `useRefreshOnLanguageChange` không?
4. ✅ Data tracking có chính xác không?