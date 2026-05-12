import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import UserLayout from "./layouts/UserLayout";

const Home = lazy(() => import("./pages/index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Step1 = lazy(() => import("./pages/quiz/Step1Skintone"));
const Step2 = lazy(() => import("./pages/quiz/Step2Undertone"));
const Step3 = lazy(() => import("./pages/quiz/Step3LipCondition"));
const Step4 = lazy(() => import("./pages/quiz/Step4Occasions"));
const Step5 = lazy(() => import("./pages/quiz/Step5Durability"));
const Results = lazy(() => import("./pages/Results"));
const SkintoneInfo = lazy(() => import("./pages/SkintoneInfo"));
const UndertoneInfo = lazy(() => import("./pages/UndertoneInfo"));
const TypeOfLipstick = lazy(() => import("./pages/TypeOfLipstick"));
const TypeDetail = lazy(() => import("./pages/TypeDetail"));
const RecommendModels = lazy(() => import("./pages/RecommendModels"));

const AuthCallback = lazy(() => import("./pages/auth/Callback"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLipTypesList = lazy(() => import("./pages/admin/lip-types/LipTypesList"));
const AdminLipTypeEditor = lazy(() => import("./pages/admin/lip-types/LipTypeEditor"));
const AdminBrandsList = lazy(() => import("./pages/admin/brands/BrandsList"));
const AdminBrandEditor = lazy(() => import("./pages/admin/brands/BrandEditor"));
const AdminFinishesList = lazy(() => import("./pages/admin/finishes/FinishesList"));
const AdminFinishEditor = lazy(() => import("./pages/admin/finishes/FinishEditor"));
const AdminProductsList = lazy(() => import("./pages/admin/products/ProductsList"));
const AdminProductEditor = lazy(() => import("./pages/admin/products/ProductEditor"));
const AdminShadesList = lazy(() => import("./pages/admin/shades/ShadesList"));
const AdminShadeEditor = lazy(() => import("./pages/admin/shades/ShadeEditor"));

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
  {
    element: <UserLayout />,
    errorElement: <ErrorFallback />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/quiz/step1-skintone", element: <Step1 /> },
      { path: "/quiz/step2-undertone", element: <Step2 /> },
      { path: "/quiz/step3-lip", element: <Step3 /> },
      { path: "/quiz/step4-occasions", element: <Step4 /> },
      { path: "/quiz/step5-durability", element: <Step5 /> },
      { path: "/results", element: <Results /> },
      { path: "/skintone", element: <SkintoneInfo /> },
      { path: "/undertone", element: <UndertoneInfo /> },
      { path: "/type-of-lipstick", element: <TypeOfLipstick /> },
      { path: "/type/:slug", element: <TypeDetail /> },
      { path: "/recommend", element: <RecommendModels /> },
      { path: "*", element: <NotFound /> },
    ],
  },
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
