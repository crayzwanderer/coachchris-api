// db.js
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "coachuser",
  password: "coachpass123!",
  database: "coachdb",
});
