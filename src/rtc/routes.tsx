import { RouteObject } from "react-router-dom";
import StreamingLayout from "./layouts/streaming-layout";
import StreamingPage from "./pages/streaming-page";

const streamingRoutes: RouteObject[] = [
  {
    path: "/streaming",
    element: <StreamingLayout />,
    children: [
      {
        index: true,
        element: <StreamingPage />,
      },
    ],
  },
];

export default streamingRoutes;
