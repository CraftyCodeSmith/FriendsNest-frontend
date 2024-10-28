import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa";
import RtcModal from "./rtc-modal";

import { Dispatch, SetStateAction } from "react";

interface IRtcSidebarProps {
  ownId: string;
  clientIds: string[];
  startCall: () => void;
  connectionStatus: boolean;
  showToastForClient: (targetId: string) => void;
  settargetId: Dispatch<SetStateAction<string>>;
}

const RtcSidebar = ({
  ownId,
  clientIds,
  connectionStatus,
  settargetId,
  startCall,
}: IRtcSidebarProps) => {
  //* ==========> handle functions
  // const handleConfirmAction = () => {
  //   console.log("Confirmed!");
  // };

  //? ==========> handle functions for showing toast notification

  return (
    <aside className=" h-full w-[268px] gap-[20px] flex flex-col">
      <div className="h-[96px] w-full bg-[#252F3F] border-[#384458] border-2 rounded-[20px]">
        <div className="px-[20px] py-[17px] gap-[20px] flex">
          <div className="w-3/4 gap-[10px] flex flex-col">
            <p className="text-white text-[18px] font-roboto-r font-medium">
              My Id:
            </p>
            <p className="text-[#24A6AF] text-[16px] truncate">{ownId}</p>
          </div>
          {!connectionStatus ? (
            <img src="/src/assets/icons/disconnected.svg" />
          ) : (
            <img src="/src/assets/icons/connected.svg" />
          )}
        </div>
      </div>
      <div className="h-full px-[20px] py-[17px] rounded-[20px] flex flex-col bg-[#252F3F]">
        <p className="text-white font-semibold font-roboto-r text-xl">
          Online Users:{" "}
        </p>
        <p className="mt-3.5 border border-[#384458]" />
        <ul className="mt-3.5 text-white">
          {clientIds.map((clientId) => (
            <div
              key={clientId}
              className="flex justify-between pb-3 gap-[20px]"
            >
              <li
                key={clientId}
                className="text-[15px] font-extralight truncate"
              >
                {clientId}
              </li>
              <Dialog>
                <div
                  className="flex items-center py-1 px-1.5 rounded-md bg-[#24A6AF]"
                  onClick={() => settargetId(clientId)}
                >
                  <DialogTrigger>
                    <FaPlus className="text-[12px] font-extralight text-white" />
                  </DialogTrigger>
                </div>
                <DialogContent className="h-[293px] w-[326px] bg-[#252F3F] border-2 border-white/20">
                  <RtcModal
                    targetClientId={clientId}
                    startCall={() => startCall()}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default RtcSidebar;
