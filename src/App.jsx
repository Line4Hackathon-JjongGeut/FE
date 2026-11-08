import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "../src/layout/RootLayout.jsx";
import Home from "../src/pages/Home/Home.jsx";
import Map from "../src/pages/Map/Map.jsx";
import Activities from "../src/pages/Activities/Activities.jsx";
import MyPage from "../src/pages/MyPage/MyPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Map />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
