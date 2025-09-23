import { BrowserRouter, Route, Routes } from "react-router";
import Admin from "./admin";
import StatisticPage from "./admin/pages/StatisticPage";
import ManageAccountPage from "./admin/pages/ManageAccountPage";
import ManageRoom from "./admin/pages/ManageRoomPage";
import ManagePostTypePage from "./admin/pages/ManagePostTypePage";
import ManageBlogPage from "./admin/pages/ManageBlogPage";
import CreateBlogPage from "./admin/pages/CreateBlogPage";
import EditBlogPage from "./admin/pages/EditBlogPage";
import LoginPage from "./admin/pages/LoginPage";
import { useAuthStore } from "./admin/stores/useAuthorStore";
import NotFound from "./admin/pages/NotFound";
import AdvertisingPage from "./admin/pages/AdvertisingPage";

function App() {
  const { loggedInUser } = useAuthStore((state) => state);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        {loggedInUser &&
          Array.isArray(loggedInUser.roles) &&
          loggedInUser.roles.some(
            (role) =>
              typeof role === "string" &&
              role.toLowerCase() === "administrators"
          ) && (
            <Route path="/admin" element={<Admin />}>
              <Route index element={<StatisticPage />} />
              <Route path="statistics" element={<StatisticPage />} />
              <Route path="manage-accounts" element={<ManageAccountPage />} />
              <Route path="manage-rooms" element={<ManageRoom />} />
              <Route path="manage-post-type" element={<ManagePostTypePage />} />
              <Route path="manage-blogs" element={<ManageBlogPage />} />
              <Route path="manage-blogs/create" element={<CreateBlogPage />} />
              <Route path="manage-blogs/edit/:slug" element={<EditBlogPage />} />
              <Route path="manage-advertisement" element={<AdvertisingPage />} />
            </Route>
          )}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
