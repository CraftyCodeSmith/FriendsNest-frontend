import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main className="h-screen sm:px-10 flex justify-center items-center">
      <Outlet />
    </main>
  );
};

export default AuthLayout;
