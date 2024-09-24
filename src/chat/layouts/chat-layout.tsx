import { Outlet } from "react-router-dom";

const ChatLayout = () => {
  return (
    <>
      <div>Chat Header</div>
      <Outlet />
      <div>Chat Footer</div>
    </>
  );
};

export default ChatLayout;
