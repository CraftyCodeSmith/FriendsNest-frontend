import { Outlet } from "react-router-dom";

const StreamingLayout = () => {
  return (
    <main className="min-h-screen w-full bg-[#151D2A]">
      <Outlet />
    </main>
  );
};

export default StreamingLayout;
