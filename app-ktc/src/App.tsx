import { BrowserRouter, Route, Routes } from "react-router";
import Admin from "./admin";
import StatisticPage from "./admin/pages/StatisticPage";
import ManageAccountPage from "./admin/pages/ManageAccountPage";
import ManageRoom from "./admin/pages/ManageRoomPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />}>
          <Route index element={<StatisticPage />} />
          <Route path="statistics" element={<StatisticPage />} />
          <Route path="statistics" element={<StatisticPage />} />
          <Route path="manage-accounts" element={<ManageAccountPage />} />
          <Route path="manage-rooms" element={<ManageRoom />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
