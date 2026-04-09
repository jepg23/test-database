const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();

app.use(cors());
app.use(express.json());

/* ✅ Serve frontend */
app.use(express.static(path.join(__dirname, "public")));

/* ✅ Database */
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "clinic_db"
});

/* ================= API ================= */

app.get("/patients", async (req, res) => {
  const { search = "", gender = "" } = req.query;
  let sql = "SELECT * FROM patients WHERE name LIKE ?";
  const params = [`%${search}%`];

  if (gender) {
    sql += " AND gender=?";
    params.push(gender);
  }

  const [rows] = await db.query(sql, params);
  res.json(rows);
});

app.post("/patients", async (req, res) => {
  const { name, dob, gender } = req.body;
  const [r] = await db.query(
    "INSERT INTO patients (name, dob, gender) VALUES (?, ?, ?)",
    [name, dob, gender]
  );
  res.json({ id: r.insertId });
});

app.put("/patients/:id", async (req, res) => {
  const { name, dob, gender } = req.body;
  await db.query(
    "UPDATE patients SET name=?, dob=?, gender=? WHERE id=?",
    [name, dob, gender, req.params.id]
  );
  res.sendStatus(204);
});

app.delete("/patients/:id", async (req, res) => {
  await db.query("DELETE FROM patients WHERE id=?", [req.params.id]);
  res.sendStatus(204);
});

/* ================= START ================= */

app.listen(3001, () => {
  console.log("✅ Full app running at http://localhost:3001");
});
