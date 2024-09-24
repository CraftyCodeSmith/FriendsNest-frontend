import { Outlet } from "react-router-dom";

const StreamingLayout = () => {
  return (
    <>
      <div>Streaming Header</div>
      <Outlet />
      <div>Streaming Footer</div>
    </>
  );
};

export default StreamingLayout;
