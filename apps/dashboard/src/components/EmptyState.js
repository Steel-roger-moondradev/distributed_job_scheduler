import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function EmptyState({ message }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-gray-500", children: [_jsx("svg", { className: "w-16 h-16 mb-4 text-gray-300", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6M9 9h6" }) }), _jsx("p", { className: "text-lg", children: message ?? "No data found." })] }));
}
