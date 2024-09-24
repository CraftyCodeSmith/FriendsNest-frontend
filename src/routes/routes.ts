import { createBrowserRouter, RouteObject } from "react-router-dom";
import authenticationRoutes from "../authentication/routes";
import chatRoutes from "../chat/routes";
import streamingRoutes from "../video/routes";

const routes: RouteObject[] = [
  ...authenticationRoutes,
  ...chatRoutes,
  ...streamingRoutes,
];

const router = createBrowserRouter(routes);

export default router;
