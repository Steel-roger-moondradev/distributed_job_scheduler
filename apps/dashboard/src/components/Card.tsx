import React from "react";

interface Props {
  title: string;
  value: string;
}

export const Card: React.FC<Props> = ({ title, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
    <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {title}
    </h3>

    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
      {value}
    </p>
  </div>
);
