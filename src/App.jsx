import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootLayout from "../src/layout/RootLayout.jsx";
import ScrollToTop from "../src/components/common/ScrollToTop.jsx";
import ProtectedRoute from "../src/components/common/ProtectedRoute.jsx";
import GuestRoute from "../src/components/common/GuestRoute.jsx";

// 메인 페이지
import Home from "../src/pages/Home/Home.jsx";
import Map from "../src/pages/Map/Map.jsx";
import Activities from "../src/pages/Activities/Activities.jsx";
import MyPage from "../src/pages/MyPage/MyPage.jsx";
import Search from "../src/pages/Search/Search.jsx";

// 보호시설 관련 페이지
import ShelterDetail from "../src/pages/Shelters/ShelterDetail.jsx";
import VolunteerDetail from "../src/pages/Shelters/VolunteerDetail.jsx";

// 후원 관련 페이지 (내 코드)
import DonationDetail from "../src/pages/Shelters/Donations/DonationDetail.jsx";

// 임시보호 관련 페이지 (내 코드)
import FosterDetail from "../src/pages/Shelters/Fosters/FosterDetail.jsx";
import FosterApply from "../src/pages/Shelters/Fosters/FosterApply.jsx";
import FosterComplete from "../src/pages/Shelters/Fosters/FosterComplete.jsx";

// 봉사활동 관련 페이지
import Apply from "../src/pages/Volunteer/Apply.jsx";
import Complete from "../src/pages/Volunteer/Complete.jsx";
import ActivityDetail from "../src/pages/Activities/ActivityDetail.jsx";

// 로그인 및 회원가입 페이지
import Intro from "../src/pages/Auth/Intro.jsx";
import Login from "../src/pages/Auth/Login.jsx";
import SignupType from "../src/pages/Auth/SignupType.jsx";
import SignupForm from "../src/pages/Auth/SignupForm.jsx";
import SignupComplete from "../src/pages/Auth/SignupComplete.jsx";

// 온보딩 관련 페이지 (팀원 코드)
import AnimalSelect from "../src/pages/Onboarding/AnimalSelect.jsx";
import RegionSelect from "../src/pages/Onboarding/RegionSelect.jsx";
import RegionMap from "../src/pages/Onboarding/RegionMap.jsx";
import ScheduleSelect from "../src/pages/Onboarding/ScheduleSelect.jsx";
import ActivitySelect from "../src/pages/Onboarding/ActivitySelect.jsx";
import ExperienceForm from "../src/pages/Onboarding/ExperienceForm.jsx";
import OnboardingComplete from "../src/pages/Onboarding/OnboardingComplete.jsx";

// 홈 추가 페이지 (팀원 코드)
import Recommendations from "../src/pages/Home/Recommendations.jsx";
import UrgentList from "../src/pages/Home/UrgentList.jsx";
import PreferenceEdit from "../src/pages/MyPage/PreferenceEdit.jsx";

// 없는 주소
import NotFound from "../src/pages/NotFound/NotFound.jsx";

function App() {
  return (
    <BrowserRouter>
      {/* 화면을 옮길 때마다 스크롤을 맨 위로 */}
      <ScrollToTop />
      <Routes>
        {/* 로그인 및 회원가입: 로그인 전에만 볼 수 있음 (로그인했으면 홈으로) */}
        <Route element={<GuestRoute />}>
          <Route path="/intro" element={<Intro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignupType />} />
          <Route path="/signup/form" element={<SignupForm />} />
        </Route>
        <Route path="/signup/complete" element={<SignupComplete />} />

        {/* 여기부터는 로그인해야 볼 수 있음 (토큰 없으면 소개 화면으로) */}
        <Route element={<ProtectedRoute />}>
          {/* 검색 */}
          <Route path="/search" element={<Search />} />

          {/* 보호시설 */}
          <Route
            path="/shelters/volunteer/:postId"
            element={<VolunteerDetail />}
          />
          <Route path="/shelters/:shelterId" element={<ShelterDetail />} />

          {/* 후원 (내 코드) */}
          <Route path="/donations/:postId" element={<DonationDetail />} />

          {/* 임시보호 (내 코드) */}
          <Route path="/fosters/:postId/apply" element={<FosterApply />} />
          <Route path="/fosters/:postId/complete" element={<FosterComplete />} />
          <Route path="/fosters/:postId" element={<FosterDetail />} />

          {/* 봉사활동 */}
          <Route path="/volunteer/apply/:postId" element={<Apply />} />
          <Route path="/volunteer/complete" element={<Complete />} />
          <Route path="/activities/:activityId" element={<ActivityDetail />} />

          {/* 온보딩 (팀원 코드) */}
          <Route path="/onboarding" element={<AnimalSelect />} />
          <Route path="/onboarding/region" element={<RegionSelect />} />
          <Route path="/onboarding/region/map" element={<RegionMap />} />
          <Route path="/onboarding/schedule" element={<ScheduleSelect />} />
          <Route path="/onboarding/activity" element={<ActivitySelect />} />
          <Route path="/onboarding/experience" element={<ExperienceForm />} />
          <Route path="/onboarding/complete" element={<OnboardingComplete />} />

          {/* 홈 추가 페이지 (팀원 코드) */}
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/urgent" element={<UrgentList />} />
          <Route path="/mypage/preferences" element={<PreferenceEdit />} />
          <Route
            path="/mypage/preferences/region"
            element={<RegionSelect mode="edit" />}
          />
          <Route
            path="/mypage/preferences/region/map"
            element={<RegionMap mode="edit" />}
          />
          <Route
            path="/mypage/preferences/experience"
            element={<ExperienceForm mode="edit" />}
          />

          {/* 공통 레이아웃이 적용되는 페이지 */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<Map />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>
        </Route>

        {/* 위에 없는 주소는 전부 404 화면으로 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;