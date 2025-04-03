"use client";
import React from "react";
import Link from "next/link";
import { Database, UserPlus, FileText } from "lucide-react";

export default function StudentManagementPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">Student Management</h1>
      <Link
        href="/student/create"
        className="p-3 w-64 bg-gray-800 rounded mb-2 flex items-center justify-center"
      >
        <UserPlus className="w-5 h-5 mr-2" /> Add Student
      </Link>
      <Link
        href="/student/output"
        className="p-3 w-64 bg-gray-800 rounded mb-2 flex items-center justify-center"
      >
        <Database className="w-5 h-5 mr-2" /> View Student
      </Link>

      <Link
        href="/student/resume"
        className="p-3 w-64 bg-gray-800 rounded flex items-center justify-center"
      >
        <FileText className="w-5 h-5 mr-2" /> Generate Resume
      </Link>
      <p className="mt-4 text-gray-400 text-sm">
        Choose an option to manage student data
      </p>
    </div>
  );
}
