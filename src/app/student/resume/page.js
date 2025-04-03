"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/app/link/lib";
import { FileIcon, Download, RefreshCw, Loader } from "lucide-react";

export default function StudentResumeGenerator() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [resumeContent, setResumeContent] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);

  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (resumeContent && !isTyping) {
      setDisplayText("");
      setTypingIndex(0);
      setIsTyping(true);
    }
  }, [resumeContent]);

  useEffect(() => {
    let timer;
    if (isTyping && typingIndex < resumeContent.length) {
      timer = setTimeout(() => {
        setDisplayText((prev) => prev + resumeContent.charAt(typingIndex));
        setTypingIndex((prev) => prev + 1);
      }, 30);
    } else if (isTyping && typingIndex >= resumeContent.length) {
      setIsTyping(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isTyping, typingIndex, resumeContent]);

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

  const generateResume = async (student) => {
    if (!student) return;

    setSelectedStudent(student);
    setGeneratingResume(true);
    setResumeContent("");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Create a professional resume for a student with the following information:
                    
                    Name: ${student.name}
                    USN: ${student.usn}
                    Email: ${student.email}
                    Phone: ${student.phone}
                    Age: ${student.age}
                    Gender: ${student.gender}
                    Address: ${student.address}
                    
                    Please include sections for Education, Skills, Objective, and Contact Information in a clean, professional format.
                    Use markdown formatting for the resume.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error?.message || "Failed to generate resume");
        return;
      }

      const resumeText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response from AI.";
      setResumeContent(resumeText);
    } catch (err) {
      setError("An error occurred while generating the resume");
      console.error(err);
    } finally {
      setGeneratingResume(false);
    }
  };

  const downloadResume = () => {
    if (!resumeContent || !selectedStudent) return;

    const blob = new Blob([resumeContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedStudent.name.replace(/\s+/g, "_")}_Resume.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-3 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
        Student Resume Generator
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Select Student</h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or USN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-white"
            />
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
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.usn}
                  className={`p-3 mb-2 rounded-lg cursor-pointer ${
                    selectedStudent?.usn === student.usn
                      ? "bg-blue-700"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{student.name}</h3>
                    <span className="text-sm bg-gray-900 px-2 py-1 rounded">
                      {student.usn}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{student.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 p-4 rounded-lg shadow-md flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Resume</h2>

            <div className="flex space-x-2">
              {selectedStudent && (
                <button
                  onClick={() => generateResume(selectedStudent)}
                  disabled={generatingResume}
                  className={`flex items-center space-x-1 p-2 rounded-lg ${
                    generatingResume
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {generatingResume ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>{generatingResume ? "Generating..." : "Generate"}</span>
                </button>
              )}

              {resumeContent && !isTyping && (
                <button
                  onClick={downloadResume}
                  className="flex items-center space-x-1 p-2 bg-green-600 hover:bg-green-700 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
            </div>
          </div>

          {selectedStudent ? (
            <div className="flex-grow flex flex-col">
              {!resumeContent && !generatingResume && (
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <FileIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>
                      Select a student and click Generate to create a resume
                    </p>
                  </div>
                </div>
              )}

              {generatingResume && !resumeContent && (
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-center">
                    <Loader className="w-12 h-12 mx-auto mb-2 animate-spin text-blue-500" />
                    <p>Generating resume for {selectedStudent.name}...</p>
                  </div>
                </div>
              )}

              {(resumeContent || isTyping) && (
                <div className="flex-grow bg-gray-800 rounded-lg p-4 overflow-y-auto whitespace-pre-wrap">
                  {isTyping ? (
                    <>
                      {displayText}
                      <span className="inline-block animate-pulse text-xl">
                        ▌
                      </span>
                    </>
                  ) : (
                    resumeContent
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-400">
              <p>Select a student to generate a resume</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
