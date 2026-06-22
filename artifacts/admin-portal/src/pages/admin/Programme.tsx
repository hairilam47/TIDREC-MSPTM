import React from "react";
import { AdminLayout } from "@/components/AdminLayout";

export default function AdminProgramme() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Programme</h1>
        <p className="text-sm text-gray-500">Build and manage the conference schedule.</p>
      </div>
    </AdminLayout>
  );
}
