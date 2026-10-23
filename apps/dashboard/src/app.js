import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import MetricsPage from "./pages/Metrics.js";
export default function App() {
    return (_jsxs(_Fragment, { children: [_jsx(Toaster, { position: "top-right", reverseOrder: false }), _jsx(Routes, { children: _jsxs(Route, { element: _jsx(DashboardLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/jobs", element: _jsx(JobsPage, {}) }), _jsx(Route, { path: "/jobs/:id", element: _jsx(JobDetailsPage, {}) }), _jsx(Route, { path: "/jobs/create", element: _jsx(CreateJob, {}) }), _jsx(Route, { path: "/failed", element: _jsx(FailedJobsPage, {}) }), _jsx(Route, { path: "/workers", element: _jsx(Workers, {}) }), _jsx(Route, { path: "/jobs/failed", element: _jsx(FailedJobsPage, {}) }), _jsx(Route, { path: "/metrics", element: _jsx(MetricsPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) })] }));
}
