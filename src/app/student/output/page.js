// File: FetchStudents.js
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/app/link/lib";

export default function FetchStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"

  useEffect(() => {
    fetchStudents();

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("card");
      } else {
        setViewMode("table");
      }
    };


    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("student")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Error fetching students: " + error.message);
        console.error("Error fetching students:", error);
      } else {
        setStudents(data || []);
      }
    } catch (err) {
      setError("Unexpected error occurred");
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (usn) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        const { error } = await supabase
          .from("student")
          .delete()
          .eq("usn", usn);

        if (error) {
          alert("Error deleting student: " + error.message);
        } else {
          alert("Student deleted successfully!");
          fetchStudents(); // Refresh the list
        }
      } catch (err) {
        console.error("Unexpected error during deletion:", err);
        alert("An unexpected error occurred");
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Card view component for each student
  const StudentCard = ({ student }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{student.name}</h3>
        <span className="text-sm bg-gray-700 px-2 py-1 rounded">
          {student.usn}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-300">
        <p>
          <span className="font-medium">Email:</span> {student.email}
        </p>
        <p>
          <span className="font-medium">Phone:</span> {student.phone}
        </p>
        <p>
          <span className="font-medium">Age:</span> {student.age}
        </p>
        <p>
          <span className="font-medium">Gender:</span> {student.gender}
        </p>
        <p>
          <span className="font-medium">Address:</span> {student.address}
        </p>
      </div>
      <div className="mt-3">
        <button
          onClick={() => handleDelete(student.usn)}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 w-full"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-3 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
        Student Records
      </h1>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-full">
            <input
              type="text"
              placeholder="Search by name or USN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-0.5 border border-gray-300 rounded-md bg-white text-black"
            />
          </div>
          <div className="flex-shrink-0 flex justify-end">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-l ${
                viewMode === "table" ? "bg-gray-600" : "bg-gray-800"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1 rounded-r ${
                viewMode === "card" ? "bg-gray-600" : "bg-gray-800"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-xl">Loading students...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p>{error}</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <p className="text-center py-10">No students found</p>
      ) : viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-sm md:text-base">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-sm md:text-base">
                  USN
                </th>
                <th className="px-3 py-2 text-left text-sm md:text-base hidden md:table-cell">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-sm md:text-base hidden md:table-cell">
                  Phone
                </th>
                <th className="px-3 py-2 text-left text-sm md:text-base hidden md:table-cell">
                  Age
                </th>
                <th className="px-3 py-2 text-left text-sm md:text-base hidden md:table-cell">
                  Gender
                </th>
                <th className="px-3 py-2 text-center text-sm md:text-base">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.usn}
                  className="border-t border-gray-600 hover:bg-gray-700"
                >
                  <td className="px-3 py-2 text-sm md:text-base">
                    {student.name}
                  </td>
                  <td className="px-3 py-2 text-sm md:text-base">
                    {student.usn}
                  </td>
                  <td className="px-3 py-2 text-sm md:text-base hidden md:table-cell">
                    {student.email}
                  </td>
                  <td className="px-3 py-2 text-sm md:text-base hidden md:table-cell">
                    {student.phone}
                  </td>
                  <td className="px-3 py-2 text-sm md:text-base hidden md:table-cell">
                    {student.age}
                  </td>
                  <td className="px-3 py-2 text-sm md:text-base hidden md:table-cell">
                    {student.gender}
                  </td>
                  // <td className="px-3 py-2 text-center">
                  //   // <button
                  //   //   onClick={() => handleDelete(student.usn)}
                  //   //   className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                  //   // >
                  //   //   Delete
                  //   // </button>
                  // </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Card View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <StudentCard key={student.usn} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
