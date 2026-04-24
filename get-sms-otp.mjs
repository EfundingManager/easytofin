import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "localhost",
  user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
  password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
  database: process.env.DATABASE_URL?.split("/").pop() || "test",
});

// Get the latest OTP code
const [rows] = await connection.execute(
  "SELECT * FROM otpCodes ORDER BY createdAt DESC LIMIT 1"
);

console.log("Latest SMS OTP:", rows[0]);

await connection.end();
