const StreamingPage = () => {
  return (
    <main className="flex h-full w-full p-3 gap-2">
      <div className="flex items-center justify-center p-3 h-[760px] w-1/2 bg-green-800/60 border-2 rounded-3xl border-green-400/60">
        Video Frame One
      </div>
      <div className="flex items-center justify-center p-3 h-[760px] w-1/2 bg-green-800/60 backdrop-blur-lg border-2 rounded-3xl border-green-400/60">
        Video Frame Two
      </div>
    </main>
  );
};

export default StreamingPage;
