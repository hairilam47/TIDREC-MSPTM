import React from "react";
import { AdminLayout } from "@/components/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of SATBDS 2027.</p>
      </div>
    </AdminLayout>
  );
}
