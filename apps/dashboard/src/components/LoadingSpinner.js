import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function LoadingSpinner() {
    return (_jsx("div", { className: "flex items-center justify-center py-10", role: "status", "aria-label": "Loading", children: _jsxs("div", { className: "relative h-6 w-6", children: [_jsx("div", { className: "absolute inset-0 rounded-full border-2 border-indigo-100" }), _jsx("div", { className: "absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" })] }) }));
}
