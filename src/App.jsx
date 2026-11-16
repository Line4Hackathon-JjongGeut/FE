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
import AnimalSelect from "../src/pages/Onboarding/AnimalSelect.jsx";
import RegionSelect from "../src/pages/Onboarding/RegionSelect.jsx";
import RegionMap from "../src/pages/Onboarding/RegionMap.jsx";
import ScheduleSelect from "../src/pages/Onboarding/ScheduleSelect.jsx";
import ActivitySelect from "../src/pages/Onboarding/ActivitySelect.jsx";
import ExperienceForm from "../src/pages/Onboarding/ExperienceForm.jsx";
import OnboardingComplete from "../src/pages/Onboarding/OnboardingComplete.jsx";
import Recommendations from "../src/pages/Home/Recommendations.jsx";
import UrgentList from "../src/pages/Home/UrgentList.jsx";
import PreferenceEdit from "../src/pages/MyPage/PreferenceEdit.jsx";

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
        <Route path="/onboarding" element={<AnimalSelect />} />
        <Route path="/onboarding/region" element={<RegionSelect />} />
        <Route path="/onboarding/region/map" element={<RegionMap />} />
        <Route path="/onboarding/schedule" element={<ScheduleSelect />} />
        <Route path="/onboarding/activity" element={<ActivitySelect />} />
        <Route path="/onboarding/experience" element={<ExperienceForm />} />
        <Route path="/onboarding/complete" element={<OnboardingComplete />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/urgent" element={<UrgentList />} />
        <Route path="/mypage/preferences" element={<PreferenceEdit />} />
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
