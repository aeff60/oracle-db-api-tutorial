// index.js
const express = require("express");
const cors = require("cors");
const oracledb = require("oracledb");
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ข้อมูลการเชื่อมต่อ Oracle
const dbConfig = {
  user: "c##devuser", // เปลี่ยนให้ตรงกับ user ที่ใช้
  password: "mypassword", // เปลี่ยนให้ตรงกับรหัสผ่านที่ตั้งไว้
  connectString: "localhost:1521/XE", // เปลี่ยนตามค่าที่ใช้ใน Oracle XE
};

async function runQuery(query, binds = [], options = {}) {
  let connection;

  try {
    // เชื่อมต่อฐานข้อมูล
    connection = await oracledb.getConnection(dbConfig);
    console.log("Connected to Oracle Database"); // ตรวจสอบการเชื่อมต่อ

    // รันคำสั่ง SQL
    const result = await connection.execute(query, binds, options);
    return result;
  } catch (err) {
    console.error("Error during query execution:", err); // แสดงข้อผิดพลาด
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("Connection closed");
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// อ่านข้อมูลผู้ใช้ทั้งหมด
app.get("/users", async (req, res) => {
  try {
    const result = await runQuery("SELECT * FROM employees");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

// อ่านข้อมูลผู้ใช้ตาม ID
app.get("/users/:id", async (req, res) => {
  try {
    const result = await runQuery(
      "SELECT * FROM employees WHERE employee_id = :id",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).send("Error fetching user");
  }
});

// สร้างผู้ใช้ใหม่
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await runQuery(
      "INSERT INTO employees (first_name, last_name, email, hire_date) VALUES (:first_name, :last_name, :email, SYSDATE) RETURNING employee_id INTO :id",
      {
        first_name: name.split(" ")[0],
        last_name: name.split(" ")[1] || "",
        email: email,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: true }
    );
    res.status(201).json({ id: result.outBinds.id[0], name, email });
  } catch (err) {
    res.status(500).send("Error creating user");
  }
});

// อัปเดตข้อมูลผู้ใช้
app.put("/users/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    await runQuery(
      "UPDATE employees SET first_name = :first_name, last_name = :last_name, email = :email WHERE employee_id = :id",
      {
        first_name: name.split(" ")[0],
        last_name: name.split(" ")[1] || "",
        email: email,
        id: req.params.id,
      },
      { autoCommit: true }
    );
    res.send("User updated successfully");
  } catch (err) {
    res.status(500).send("Error updating user");
  }
});

// ลบผู้ใช้
app.delete("/users/:id", async (req, res) => {
  try {
    await runQuery(
      "DELETE FROM employees WHERE employee_id = :id",
      [req.params.id],
      { autoCommit: true }
    );
    res.send("User deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting user");
  }
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
