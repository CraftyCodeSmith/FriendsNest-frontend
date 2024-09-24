import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <>
      <div>Auth Header</div>
      <Outlet />
      <div>Auth Footer</div>
    </>
  );
};

export default AuthLayout;
