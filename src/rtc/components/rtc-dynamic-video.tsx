import { RefObject, useEffect } from "react";

interface IRtcDyanmicVideoProps {
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  isMediaAccessGranted: boolean;
}

const RtcDynamicVideo = ({
  localVideoRef,
  remoteVideoRef,
  isMediaAccessGranted,
}: IRtcDyanmicVideoProps) => {
  useEffect(() => {
    console.log(
      localVideoRef.current,
      remoteVideoRef.current,
      "----------------------------yooy"
    );
  }, [localVideoRef, remoteVideoRef]);
  return (
    <main className="h-full p-[25px] flex-1 flex flex-col gap-[40px] bg-[#252F3F] rounded-[20px] overflow-hidden">
      {/* Local Video Container */}
      <div className="h-1/2 w-full flex justify-center items-center bg-[#49586E] rounded-[20px] overflow-hidden text-white font-roboto-r font-semibold text-lg">
        {isMediaAccessGranted ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-[20px]"
          />
        ) : (
          <p className="text-center p-8 w-full h-full flex items-center justify-center rounded-[20px]">
            Video not started yet!
          </p>
        )}
      </div>

      {/* Remote Video Container */}
      <div className="h-1/2 w-full flex justify-center items-center bg-[#49586E] rounded-[20px] overflow-hidden text-white font-roboto-r font-semibold text-lg">
        {remoteVideoRef ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-[20px]"
          />
        ) : (
          <p className="text-center p-8 w-full h-full flex items-center justify-center rounded-[20px]">
            Video not started yet!
          </p>
        )}
      </div>
    </main>
  );
};

export default RtcDynamicVideo;
