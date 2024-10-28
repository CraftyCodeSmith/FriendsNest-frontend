import { Button } from "@/components/ui/button";

interface IRtcToastProps {
  onConfirm: () => void;
  onClose: () => void;
}
const RtcToast = ({ onConfirm, onClose }: IRtcToastProps) => {
  return (
    <div className="h-[98px] w-[611px] py-[24px] px-[30px] flex items-center justify-between bg-[#252F3F] border-2 border-white/20 shadow-lg rounded-[20px]">
      <div className="h-[50px] w-[50px]">
        <img src={"/src/assets/icons/modal-connect.svg"} />
      </div>
      <div>
        <p className="text-white text-xl font-roboto-r"> Join the call </p>
        <p className="text-white/40">
          {" "}
          User Id: <span className="text-[#24A6AF]"> tusharr_108.nest </span>
        </p>
      </div>
      <div className="flex gap-[20px]">
        <Button
          className="h-[40px] w-[123px] text-[16px] bg-[#24A6AF] text-white rounded-3xl hover:bg-[#7ae9f0] hover:text-[#123538] hover:border-[#123538] hover:border duration-200 transition-all ease-linear"
          onClick={onConfirm}
        >
          Accept
        </Button>
        <Button
          className="h-[40px] w-[123px] text-[16px] bg-white rounded-3xl hover:bg-red-200 hover:text-red-900 hover:border-red-900 hover:border duration-200 transition-all ease-linear"
          onClick={onClose}
        >
          Decline
        </Button>
      </div>
    </div>
  );
};

export default RtcToast;
