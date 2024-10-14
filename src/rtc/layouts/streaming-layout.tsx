import { Outlet } from "react-router-dom";
import RtcHeader from "../components/rtc-header";
import RtcFooter from "../components/rtc-footer";

const StreamingLayout = () => {
  return (
    <main className="flex flex-col min-h-screen w-full">
      <header>
        <RtcHeader />
      </header>
      <main className="flex-1 bg-green-950 border-t-2 border-b-2 border-yellow-200">
        <Outlet />
      </main>
      <footer>
        <RtcFooter />
      </footer>
    </main>
  );
};

export default StreamingLayout;
