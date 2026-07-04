import React from "react";
interface Props {
  title: string;
  value: string;
}
export const Card: React.FC<Props> = ({ title, value }) => (
  <div className="p-6 bg-white rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
  </div>
);
