import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Custom hook để tự động refresh data khi ngôn ngữ thay đổi
 * @param refreshCallback - Function sẽ được gọi khi ngôn ngữ thay đổi
 * @param dependencies - Array dependencies để kiểm soát khi nào refresh
 */
export const useRefreshOnLanguageChange = (
  refreshCallback: () => void | Promise<void>,
  dependencies: any[] = []
) => {
  const { onLanguageChange } = useLanguage();

  useEffect(() => {
    const unsubscribe = onLanguageChange(() => {
      // Delay một chút để đảm bảo header đã được cập nhật
      setTimeout(() => {
        refreshCallback();
      }, 100);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};