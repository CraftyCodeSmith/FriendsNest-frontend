import { RouteObject } from "react-router-dom";
import StreamingLayout from "./layouts/streaming-layout";
import StreamingPage from "./pages/streaming-page";
import ProtectedRoute from "@/routes/ProtectedRoute";

const streamingRoutes: RouteObject[] = [
  {
    path: "/streaming",
    element: (
      <ProtectedRoute>
        <StreamingLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <StreamingPage />,
      },
    ],
  },
];

export default streamingRoutes;
