import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DataTable from "../components/DataTable";

import { getAdminList } from "../api/adminApi";


export default function CourseRegistrations() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminList("/course-registrations")
      .then((data) => {
        setItems(Array.isArray(data) ? data : data.items || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Course registrations could not be loaded.");
      });
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-main">
        <Header
          title="Course Registrations"
          subtitle="Students registered for AxelPath Academy courses."
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="admin-page-content">
          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          <DataTable
            data={items}
            columns={[
              {
                key: "registration_id",
                label: "Registration ID",
              },
              {
                key: "full_name",
                label: "Name",
              },
              {
                key: "email",
                label: "Email",
              },
              {
                key: "phone",
                label: "Phone",
              },
              {
                key: "course_title",
                label: "Course",
              },
              {
                key: "status",
                label: "Status",
              },
              {
                key: "created_at",
                label: "Registered",
              },
            ]}
          />
        </div>
      </main>
    </div>
  );
}