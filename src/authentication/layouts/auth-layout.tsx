import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

const AuthLayout = () => {
  return (
    <main className="h-screen sm:px-10 flex justify-center items-center">
      <Outlet />
      <Toaster />
    </main>
  );
};

export default AuthLayout;
