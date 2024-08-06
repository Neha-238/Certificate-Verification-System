import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import XLSX from "xlsx";

// Initialize Express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/certificate_verification")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// User Schemas
const studentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  uploadedData: [{ type: mongoose.Schema.Types.ObjectId, ref: "StudentData" }],
});

// Define a new Schema and Model for student_data
const studentDataSchema = new mongoose.Schema({
  email: { type: String },
  certificateId: { type: String, required: true },
  name: { type: String, required: true },
  internshipDomain: { type: String, required: true },
  internshipStartDate: { type: Date, required: true },
  internshipEndDate: { type: Date, required: true },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
});

// Define models and specify collection names
const Student = mongoose.model("Student", studentSchema, "students");
const Admin = mongoose.model("Admin", adminSchema, "admins");
const StudentData = mongoose.model(
  "StudentData",
  studentDataSchema,
  "student_data"
);

// Registration Route
app.post("/api/register", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Email, password, and role are required" });
    }

    if (role === "Student") {
      // Check if the student already exists
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ error: "Student already registered" });
      }
      const newStudent = new Student({ email, password });
      await newStudent.save();
    } else if (role === "Admin") {
      // Check if the admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ error: "Admin already registered" });
      }
      const newAdmin = new Admin({ email, password });
      await newAdmin.save();
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ error: "Registration failed", details: error.message });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user =
      role === "Student"
        ? await Student.findOne({ email })
        : await Admin.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or role" });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Function to convert Excel serial date to JavaScript Date and format as yyyy-mm-dd
function excelSerialDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const date_info = new Date(utc_days * 86400 * 1000);
  const fractional_day = serial - Math.floor(serial); // Fractional part of the day
  const total_seconds = Math.floor(86400 * fractional_day); // Convert fractional day to seconds
  const hours = Math.floor(total_seconds / (60 * 60)); // Extract hours
  const minutes = Math.floor((total_seconds / 60) % 60); // Extract minutes

  // Create a Date object with extracted date and time
  const date = new Date(
    date_info.getFullYear(),
    date_info.getMonth(),
    date_info.getDate(),
    hours,
    minutes
  );

  // Format the date as yyyy-mm-dd
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

//uploaad route
app.post("/api/upload", upload.single("file"), async (req, res) => {
  const { adminEmail } = req.body;

  try {
    console.log("Received adminEmail:", adminEmail);

    if (!req.file) {
      console.error("No file uploaded");
      throw new Error("No file uploaded");
    }

    if (!adminEmail) {
      console.error("Admin email is required");
      throw new Error("Admin email is required");
    }

    console.log("Received file:", req.file.originalname);

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log("Data parsed from file:", data);

    const admin = await Admin.findOne({
      email: new RegExp(`^${adminEmail}$`, "i"),
    });
    console.log("Admin from database:", admin);

    if (!admin) {
      console.error("Admin not found");
      throw new Error("Admin not found");
    }

    const studentIds = [];
    for (const item of data) {
      const startDate =
        typeof item.internshipStartDate === "number"
          ? excelSerialDateToJSDate(item.internshipStartDate)
          : new Date(item.internshipStartDate);
      const endDate =
        typeof item.internshipEndDate === "number"
          ? excelSerialDateToJSDate(item.internshipEndDate)
          : new Date(item.internshipEndDate);

      const newStudentData = await StudentData.create({
        certificateId: item.certificateID,
        email: item.email,
        name: item.name,
        internshipDomain: item.internshipDomain,
        internshipStartDate: startDate,
        internshipEndDate: endDate,
        adminId: admin._id,
      });
      studentIds.push(newStudentData._id);
    }

    admin.uploadedData.push(...studentIds);
    await admin.save();

    res
      .status(200)
      .json({ message: "File uploaded and data saved successfully!" });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      error: "Failed to upload file",
      details: error.message || "An unknown error occurred",
    });
  }
});

// Search certificate route
app.get("/api/certificate/student_data/:certificateId", async (req, res) => {
  const { certificateId } = req.params;

  try {
    const certificate = await StudentData.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    res.status(200).json(certificate);
  } catch (error) {
    console.error("Error searching for certificate:", error);
    res
      .status(500)
      .json({ error: "An error occurred while searching for the certificate" });
  }
});

// Start server
const PORT = 5000; // Ensure this port is free or use a different one
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
