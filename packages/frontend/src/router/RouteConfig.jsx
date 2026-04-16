import Home from "../../../../frontend/src/pages/Home";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import Header from "../../../../frontend/src/components/ui/Header";
import Footer from "../../../../frontend/src/components/ui/Footer";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element:
      <>
        <Header />
        <Outlet />
        <Footer />
      </>,
    //errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ]
  }
]);

export default router;