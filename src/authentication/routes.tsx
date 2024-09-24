import { RouteObject } from "react-router-dom";
import AuthLayout from "./layouts/auth-layout";
import LoginPage from "./pages/login-page";
import RegisterPage from "./pages/register-page";

const authenticationRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
];

export default authenticationRoutes;
