import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout.js";
import DashboardPage from "./pages/DashboardPage.js";
import JobsPage from "./pages/JobsPage.js";
import JobDetailsPage from "./pages/JobDetailsPage.js";
import FailedJobsPage from "./pages/FailedJobsPage.js";
import NotFound from "./pages/NotFound.js";
import { Toaster } from "react-hot-toast";
import CreateJob from "./pages/CreateJob.js";
import { Workers } from "./pages/WorkerPage.js";

export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/jobs/create" element={<CreateJob />} />
          <Route path="/failed" element={<FailedJobsPage />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/jobs/failed" element={<FailedJobsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
