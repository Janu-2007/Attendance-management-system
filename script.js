// Get data from localStorage
let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

// Set today's date
const dateInput = document.getElementById("attendanceDate");

const today = new Date().toISOString().split("T")[0];

dateInput.value = today;


// Save data
function saveData() {
    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("attendance", JSON.stringify(attendance));
}


// Add student
document.getElementById("studentForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const id = document.getElementById("studentId").value.trim();
    const name = document.getElementById("studentName").value.trim();

    if (id === "" || name === "") {
        alert("Please enter student ID and name.");
        return;
    }

    // Check duplicate ID
    const existingStudent = students.find(student => student.id === id);

    if (existingStudent) {
        alert("Student ID already exists!");
        return;
    }

    students.push({
        id: id,
        name: name
    });

    saveData();

    document.getElementById("studentForm").reset();

    displayStudents();
    displayHistory();
    updateDashboard();

    alert("Student added successfully!");
});


// Display students
function displayStudents() {

    const table = document.getElementById("studentTable");

    table.innerHTML = "";

    if (students.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">No students found.</td>
            </tr>
        `;

        return;
    }

    students.forEach(student => {

        const status = getTodayStatus(student.id);

        const percentage = calculateAttendance(student.id);

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${student.id}</td>

            <td>${student.name}</td>

            <td>
                ${
                    status === "Present"
                    ? '<span class="status-present">Present</span>'
                    : status === "Absent"
                    ? '<span class="status-absent">Absent</span>'
                    : '<span>Not Marked</span>'
                }
            </td>

            <td>${percentage}%</td>

            <td>

                <button
                    class="present-btn"
                    onclick="markAttendance('${student.id}', 'Present')">
                    Present
                </button>

                <button
                    class="absent-btn"
                    onclick="markAttendance('${student.id}', 'Absent')">
                    Absent
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudent('${student.id}')">
                    Delete
                </button>

            </td>
        `;

        table.appendChild(row);
    });
}


// Mark attendance
function markAttendance(studentId, status) {

    const selectedDate = dateInput.value;

    if (!selectedDate) {
        alert("Please select a date.");
        return;
    }

    // Check if attendance already exists
    const existingRecord = attendance.find(record =>
        record.studentId === studentId &&
        record.date === selectedDate
    );

    if (existingRecord) {

        existingRecord.status = status;

    } else {

        attendance.push({
            studentId: studentId,
            date: selectedDate,
            status: status
        });

    }

    saveData();

    displayStudents();
    displayHistory();
    updateDashboard();
}


// Get today's status
function getTodayStatus(studentId) {

    const selectedDate = dateInput.value;

    const record = attendance.find(record =>
        record.studentId === studentId &&
        record.date === selectedDate
    );

    return record ? record.status : null;
}


// Calculate attendance percentage
function calculateAttendance(studentId) {

    const records = attendance.filter(record =>
        record.studentId === studentId
    );

    if (records.length === 0) {
        return 0;
    }

    const presentCount = records.filter(record =>
        record.status === "Present"
    ).length;

    return ((presentCount / records.length) * 100).toFixed(2);
}


// Delete student
function deleteStudent(studentId) {

    const student = students.find(student =>
        student.id === studentId
    );

    if (!student) {
        return;
    }

    const confirmDelete = confirm(
        `Delete student ${student.name}?`
    );

    if (!confirmDelete) {
        return;
    }

    students = students.filter(student =>
        student.id !== studentId
    );

    attendance = attendance.filter(record =>
        record.studentId !== studentId
    );

    saveData();

    displayStudents();
    displayHistory();
    updateDashboard();
}


// Display attendance history
function displayHistory() {

    const historyTable = document.getElementById("historyTable");

    historyTable.innerHTML = "";

    if (attendance.length === 0) {

        historyTable.innerHTML = `
            <tr>
                <td colspan="4">No attendance records found.</td>
            </tr>
        `;

        return;
    }

    // Sort newest first
    const sortedAttendance = [...attendance].sort(
        (a, b) => b.date.localeCompare(a.date)
    );

    sortedAttendance.forEach(record => {

        const student = students.find(student =>
            student.id === record.studentId
        );

        if (!student) {
            return;
        }

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${record.date}</td>

            <td>${student.id}</td>

            <td>${student.name}</td>

            <td class="${
                record.status === "Present"
                ? "status-present"
                : "status-absent"
            }">
                ${record.status}
            </td>

        `;

        historyTable.appendChild(row);
    });
}


// Update dashboard
function updateDashboard() {

    const selectedDate = dateInput.value;

    const todayRecords = attendance.filter(record =>
        record.date === selectedDate
    );

    const present = todayRecords.filter(record =>
        record.status === "Present"
    ).length;

    const absent = todayRecords.filter(record =>
        record.status === "Absent"
    ).length;

    const totalMarked = present + absent;

    let percentage = 0;

    if (totalMarked > 0) {
        percentage = ((present / totalMarked) * 100).toFixed(2);
    }

    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("presentToday").textContent =
        present;

    document.getElementById("absentToday").textContent =
        absent;

    document.getElementById("attendancePercentage").textContent =
        percentage + "%";
}


// Change date
dateInput.addEventListener("change", function() {

    displayStudents();
    updateDashboard();

});


// Initial display
displayStudents();
displayHistory();
updateDashboard();
