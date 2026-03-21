import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    // Redirect dựa trên role của user
    if (user?.role?.includes('Admin') || user?.role?.includes('Administrator')) {
      return <Navigate to="/admin/dashboard" replace />;
    // } else if (user?.role?.includes('Instructor')) {
    //   return <Navigate to="/instructor/dashboard" replace />;
    } else {
      return <Navigate to="/user/home" replace />;
    }
  }

  return <>{children}</>;
};

interface InstructorRouteProps {
  children: React.ReactNode;
}

export const InstructorRoute: React.FC<InstructorRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role?.includes('Instructor')) {
    // Redirect dựa trên role của user
    if (user?.role?.includes('Admin') || user?.role?.includes('Administrator')) {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/home" replace />;
    }
  }

  return <>{children}</>;
};

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role có phải là Admin hoặc Administrator không
  if (!user?.role?.includes('Admin') && !user?.role?.includes('Administrator')) {
    return <Navigate to="/user/home" replace />;
  }

  return <>{children}</>;
};

interface UserRouteProps {
  children: React.ReactNode;
}

export const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Chặn admin truy cập trang user
  if (user?.role?.includes('Admin') || user?.role?.includes('Administrator')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};