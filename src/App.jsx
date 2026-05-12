import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import UserLayout from "./layouts/UserLayout.jsx";

/* ===== Lazy pages (User) ===== */
const Home = lazy(() => import("./pages/index.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Step1 = lazy(() => import("./pages/quiz/Step1Skintone.jsx"));
const Step2 = lazy(() => import("./pages/quiz/Step2Undertone.jsx"));
const Step3 = lazy(() => import("./pages/quiz/Step3LipCondition.jsx"));
const Step4 = lazy(() => import("./pages/quiz/Step4Occasions.jsx"));
const Step5 = lazy(() => import("./pages/quiz/Step5Durability.jsx"));
const Results = lazy(() => import("./pages/Results.jsx"));
const SkintoneInfo = lazy(() => import("./pages/SkintoneInfo.jsx"));
const UndertoneInfo = lazy(() => import("./pages/UndertoneInfo.jsx"));
const TypeOfLipstick = lazy(() => import("./pages/TypeOfLipstick.jsx"));
const TypeDetail = lazy(() => import("./pages/TypeDetail.jsx"));
const RecommendModels = lazy(() => import("./pages/RecommendModels.jsx"));

/* ===== Lazy pages (Auth) ===== */
const AuthCallback = lazy(() => import("./pages/auth/Callback.jsx"));

/* ===== Lazy pages (Admin) ===== */
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminLipTypesList = lazy(() => import("./pages/admin/lip-types/LipTypesList.jsx"));
const AdminLipTypeEditor = lazy(() => import("./pages/admin/lip-types/LipTypeEditor.jsx"));
const AdminBrandsList = lazy(() => import("./pages/admin/brands/BrandsList.jsx"));
const AdminBrandEditor = lazy(() => import("./pages/admin/brands/BrandEditor.jsx"));
const AdminFinishesList = lazy(() => import("./pages/admin/finishes/FinishesList.jsx"));
const AdminFinishEditor = lazy(() => import("./pages/admin/finishes/FinishEditor.jsx"));
const AdminProductsList = lazy(() => import("./pages/admin/products/ProductsList.jsx"));
const AdminProductEditor = lazy(() => import("./pages/admin/products/ProductEditor.jsx"));
const AdminShadesList = lazy(() => import("./pages/admin/shades/ShadesList.jsx"));
const AdminShadeEditor = lazy(() => import("./pages/admin/shades/ShadeEditor.jsx"));

function ErrorFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-8">
        <h1 className="text-xl font-semibold">มีบางอย่างผิดพลาด</h1>
        <p className="opacity-80 mt-2">
          ลองรีเฟรชหน้า หรือเปิด DevTools → Console ดู error แรกสุดนะ
        </p>
      </main>
      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  // ===== Public (User) — UserLayout ใช้ <Outlet> + <Suspense> ครอบทุก children =====
  {
    element: <UserLayout />,
    errorElement: <ErrorFallback />,
    children: [
      { path: "/", element: <Home /> },

      // Quiz
      { path: "/quiz/step1-skintone", element: <Step1 /> },
      { path: "/quiz/step2-undertone", element: <Step2 /> },
      { path: "/quiz/step3-lip", element: <Step3 /> },
      { path: "/quiz/step4-occasions", element: <Step4 /> },
      { path: "/quiz/step5-durability", element: <Step5 /> },

      // Info
      { path: "/results", element: <Results /> },
      { path: "/skintone", element: <SkintoneInfo /> },
      { path: "/undertone", element: <UndertoneInfo /> },

      // Types
      { path: "/type-of-lipstick", element: <TypeOfLipstick /> },
      { path: "/type/:slug", element: <TypeDetail /> },

      // Recommend
      { path: "/recommend", element: <RecommendModels /> },

      // 404
      { path: "*", element: <NotFound /> },
    ],
  },

  // ===== Auth callback =====
  {
    path: "/auth/callback",
    element: (
      <Suspense fallback={<div className="p-8 text-center">กำลังโหลด…</div>}>
        <AuthCallback />
      </Suspense>
    ),
  },
  {
    path: "/admin/callback",
    element: <Navigate to="/auth/callback" replace />,
  },

  // ===== Admin =====
  {
    path: "/admin/login",
    element: (
      <Suspense fallback={<div className="p-8 text-center">กำลังโหลด…</div>}>
        <AdminLogin />
      </Suspense>
    ),
  },
  {
    path: "/admin",
    element: (
      <Suspense fallback={<div className="p-8 text-center">กำลังโหลด…</div>}>
        <AdminLayout />
      </Suspense>
    ),
    errorElement: <ErrorFallback />,
    children: [
      { index: true, element: <AdminDashboard /> },

      { path: "lip-types", element: <AdminLipTypesList /> },
      { path: "lip-types/:code", element: <AdminLipTypeEditor /> },

      { path: "brands", element: <AdminBrandsList /> },
      { path: "brands/:id", element: <AdminBrandEditor /> },

      { path: "finishes", element: <AdminFinishesList /> },
      { path: "finishes/:id", element: <AdminFinishEditor /> },

      { path: "products", element: <AdminProductsList /> },
      { path: "products/:id", element: <AdminProductEditor /> },

      { path: "shades", element: <AdminShadesList /> },
      { path: "shades/:id", element: <AdminShadeEditor /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
