import React from "react";
import { AdminLayout } from "@/components/AdminLayout";

export default function AdminAnnouncements() {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Announcements</h1>
        <p className="text-sm text-gray-500">Publish announcements to delegates.</p>
      </div>
    </AdminLayout>
  );
}
