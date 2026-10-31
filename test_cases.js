const assert = require("assert");

const BASE_URL = "http://localhost:3000";

async function runTests() {
    console.log("Starting API Test Cases...\n");

    // Test 1: GET status 200
    let response = await fetch(`${BASE_URL}/students`);
    assert.strictEqual(response.status, 200);
    console.log("Test 1 Passed: GET status is 200");

    // Test 2: GET contains student data
    let result = await response.json();
    assert.ok(result.data.length > 0);
    console.log("Test 2 Passed: Student data retrieved");

    // Test 3: GET contains roll number
    assert.ok(result.data.some(s => s.rollNo === "23071A05B1"));
    console.log("Test 3 Passed: Roll number found");

    // Test 4: POST status 201
    response = await fetch(`${BASE_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Test Student",
            rollNo: "23071A05B1",
            course: "CSE"
        })
    });
    assert.strictEqual(response.status, 201);
    console.log("Test 4 Passed: POST status is 201");

    // Test 5: POST creates student
    result = await response.json();
    const studentId = result.data.id;
    assert.ok(studentId !== undefined);
    console.log("Test 5 Passed: Student created");

    // Test 6: PATCH status 200
    response = await fetch(`${BASE_URL}/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course: "Computer Science" })
    });
    assert.strictEqual(response.status, 200);
    console.log("Test 6 Passed: PATCH status is 200");

    // Test 7: PATCH updates student
    result = await response.json();
    assert.strictEqual(result.data.course, "Computer Science");
    console.log("Test 7 Passed: Student updated");

    // Test 8: DELETE status 200
    response = await fetch(`${BASE_URL}/students/${studentId}`, {
        method: "DELETE"
    });
    assert.strictEqual(response.status, 200);
    console.log("Test 8 Passed: DELETE status is 200");

    // Test 9: DELETE removes student
    response = await fetch(`${BASE_URL}/students/${studentId}`);
    assert.strictEqual(response.status, 404);
    console.log("Test 9 Passed: Student deleted");

    console.log("\nAll API test cases passed successfully.");
}

runTests().catch(error => {
    console.error("Test Failed:", error.message);
    process.exitCode = 1;
});
