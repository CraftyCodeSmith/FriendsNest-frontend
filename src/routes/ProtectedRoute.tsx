// components/ProtectedRoute.jsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode; // `children` can be any renderable React content
}
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = sessionStorage.getItem("authToken"); // Check if token exists in sessionStorage

  // If there's no token, redirect to the login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If token exists, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
