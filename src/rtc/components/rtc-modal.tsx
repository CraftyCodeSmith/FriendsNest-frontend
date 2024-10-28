import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IRtcModalProps {
  targetClientId: string;
  startCall: () => void;
  showToast: () => void;
}

const RtcModal = ({ startCall, showToast, targetClientId }: IRtcModalProps) => {
  return (
    <>
      <DialogHeader className="relative h-[50px]">
        <DialogTitle className="absolute top-[25%] left-[37%] justify-center">
          <img src={"/src/assets/icons/modal-connect.svg"} />
        </DialogTitle>
      </DialogHeader>
      <div className="h-[85px] w-full mt-[30px] flex flex-col gap-[10px] justify-center items-center">
        <p className="text-white text-xl font-roboto-r">
          Connect with a friend
        </p>
        <p className="text-white/30 font-roboto-r">
          {" "}
          UserId:{" "}
          <span className="text-[#24A6AF] text-start truncate">
            {targetClientId}{" "}
          </span>
        </p>{" "}
      </div>
      <DialogFooter className="relative flex pr-[4px]">
        <DialogClose className="absolute bottom-[-10px]  left-3.5">
          <Button className="h-[40px] w-[123px] text-[16px] bg-white rounded-3xl hover:bg-red-200 hover:text-red-900 hover:border-red-900 hover:border duration-200 transition-all ease-linear">
            Cancel
          </Button>
        </DialogClose>
        <DialogClose className="absolute bottom-[-10px] right-3.5">
          <Button
            className="h-[40px] w-[123px] text-[16px] bg-[#24A6AF] text-white rounded-3xl hover:bg-[#7ae9f0] hover:text-[#123538] hover:border-[#123538] hover:border duration-200 transition-all ease-linear"
            onClick={() => {
              startCall();
              showToast();
            }}
          >
            Start Call
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
};

export default RtcModal;
