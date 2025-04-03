// File: CreateStudent.js
"use client";
import React, { useState } from "react";
import InputField from "@/app/component/InputField";
import { supabase } from "@/app/link/lib";

export default function CreateStudent() {
  const [name, setName] = useState("");
  const [usn, setUSN] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  const handleAddStudent = async () => {
    if (!usn || !name || !email || !phone || !address || !gender || !age) {
      alert("All fields are mandatory!");
      return;
    }

    try {
      const { data: existingStudent } = await supabase
        .from("student")
        .select("usn")
        .eq("usn", usn);

      if (existingStudent.length > 0) {
        alert("USN already exists!");
        return;
      }

      // Create timestamp for created_at
      const created_at = new Date().toISOString();

      const { data, error } = await supabase.from("student").insert([
        {
          name,
          usn,
          email,
          phone,
          address,
          gender,
          age,
          created_at,
        },
      ]);

      if (error) {
        alert("Error inserting data: " + error.message);
      } else {
        alert(`Student added successfully! 🎉\n ${JSON.stringify(data)}`);
        setName("");
        setUSN("");
        setEmail("");
        setPhone("");
        setAddress("");
        setGender("");
        setAge("");
      }
    } catch (err) {
      console.error(`Unexpected error: ${JSON.stringify(err)}`);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-160">
        <h1 className="text-2xl font-bold text-center mb-4 text-white">
          Create Student
        </h1>

        <div className="space-y-3">
          <InputField
            type="text"
            value={name}
            placeholder="Student Name"
            onChange={(e) => setName(e.target.value)}
            className="bg-white text-black"
          />
          <InputField
            type="text"
            value={usn}
            placeholder="Student USN"
            onChange={(e) => setUSN(e.target.value)}
            className="bg-white text-black"
          />
          <InputField
            type="email"
            value={email}
            placeholder="Student Email"
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white text-black"
          />
          <InputField
            type="text"
            value={address}
            placeholder="Student Address"
            onChange={(e) => setAddress(e.target.value)}
            className="bg-white text-black"
          />
          <InputField
            type="number"
            value={phone}
            placeholder="Phone Number"
            onChange={(e) => setPhone(e.target.value)}
            className="bg-white text-black"
          />
          <InputField
            type="number"
            value={age}
            placeholder="Age"
            onChange={(e) => setAge(e.target.value)}
            className="bg-white text-black"
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button
            onClick={handleAddStudent}
            className="w-full bg-gray-700 text-white p-2 rounded-md hover:bg-gray-600"
          >
            Add Student
          </button>
        </div>
      </div>
    </div>
  );
}
