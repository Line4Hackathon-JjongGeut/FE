import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "../src/layout/RootLayout.jsx";
import Home from "../src/pages/Home/Home.jsx";
import Map from "../src/pages/Map/Map.jsx";
import Activities from "../src/pages/Activities/Activities.jsx";
import MyPage from "../src/pages/MyPage/MyPage.jsx";
import Search from "../src/pages/Search/Search.jsx";
import ShelterDetail from "../src/pages/Shelters/ShelterDetail.jsx";
import VolunteerDetail from "../src/pages/Shelters/VolunteerDetail.jsx";
import Apply from "../src/pages/Volunteer/Apply.jsx";
import Complete from "../src/pages/Volunteer/Complete.jsx";
import ActivityDetail from "../src/pages/Activities/ActivityDetail.jsx";
import Intro from "../src/pages/Auth/Intro.jsx";
import Login from "../src/pages/Auth/Login.jsx";
import SignupType from "../src/pages/Auth/SignupType.jsx";
import SignupForm from "../src/pages/Auth/SignupForm.jsx";
import SignupComplete from "../src/pages/Auth/SignupComplete.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/search" element={<Search />} />
        <Route
          path="/shelters/volunteer/:postId"
          element={<VolunteerDetail />}
        />
        <Route path="/shelters/:shelterId" element={<ShelterDetail />} />
        <Route path="/volunteer/apply/:postId" element={<Apply />} />
        <Route path="/volunteer/complete" element={<Complete />} />
        <Route path="/activities/:activityId" element={<ActivityDetail />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupType />} />
        <Route path="/signup/form" element={<SignupForm />} />
        <Route path="/signup/complete" element={<SignupComplete />} />
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
