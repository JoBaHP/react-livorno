import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  // 1. While the authentication check is running, show a loading message.
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t('auth_checking')}
      </div>
    );
  }

  // 2. If the check is done and there's no user, redirect to the login page.
  if (!user) {
    return <Navigate to="/staff/login" state={{ from: location }} replace />;
  }

  // 3. If the user's role is not allowed, redirect them away.
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/staff/waiter" replace />;
  }

  // 4. If everything is okay, show the requested page.
  return <Outlet />;
};

export default ProtectedRoute;
