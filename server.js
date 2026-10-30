
const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// Initial student records
let students = [
  {
    id: 1,
    name: 'Pakala Vedh',
    rollNo: '23071A05B1',
    course: 'Computer Science'
  },
  {
    id: 2,
    name: 'Vedh',
    rollNo: '23071A05B1',
    course: 'Information Technology'
  }
];

// GET - Retrieve all students
app.get('/students', (req, res) => {
  res.json({
    success: true,
    message: 'Students retrieved successfully',
    data: students
  });
});

// GET - Retrieve one student
app.get('/students/:id', (req, res) => {
  const student = students.find(
    item => item.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  res.json({
    success: true,
    message: 'Student retrieved successfully',
    data: student
  });
});

// POST - Add a student
app.post('/students', (req, res) => {
  const { name, rollNo, course } = req.body;

  if (!name || !rollNo || !course) {
    return res.status(400).json({
      success: false,
      message: 'name, rollNo, and course are required'
    });
  }

  const newStudent = {
    id: students.length
      ? Math.max(...students.map(item => item.id)) + 1
      : 1,
    name,
    rollNo,
    course
  };

  students.push(newStudent);

  res.status(201).json({
    success: true,
    message: 'Student added successfully',
    data: newStudent
  });
});

// PATCH - Update student details
app.patch('/students/:id', (req, res) => {
  const student = students.find(
    item => item.id === Number(req.params.id)
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  const { name, rollNo, course } = req.body;

  if (name !== undefined) student.name = name;
  if (rollNo !== undefined) student.rollNo = rollNo;
  if (course !== undefined) student.course = course;

  res.json({
    success: true,
    message: 'Student updated successfully',
    data: student
  });
});

// DELETE - Remove a student
app.delete('/students/:id', (req, res) => {
  const studentIndex = students.findIndex(
    item => item.id === Number(req.params.id)
  );

  if (studentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  const deletedStudent = students.splice(studentIndex, 1)[0];

  res.json({
    success: true,
    message: 'Student deleted successfully',
    data: deletedStudent
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
