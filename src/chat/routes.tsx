import { RouteObject } from "react-router-dom";
import ChatLayout from "./layouts/chat-layout";
import ChatRoomsPage from "./pages/chat-rooms-page";

const chatRoutes: RouteObject[] = [
  {
    path: "/chat",
    element: <ChatLayout />,
    children: [
      {
        index: true,
        element: <ChatRoomsPage />,
      },
      {
        path: ":roomId",
        element: <ChatRoomsPage />,
      },
    ],
  },
];

export default chatRoutes;
