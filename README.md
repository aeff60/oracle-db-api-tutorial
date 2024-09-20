# Simple API for demo OracleDB

โปรเจกต์นี้เป็น API อย่างง่ายที่สร้างด้วย Express เพื่อสาธิตการใช้งานร่วมกับฐานข้อมูล Oracle Database ผ่าน `oracledb` module เหมาะสำหรับผู้ที่ต้องการศึกษาและทดลองการทำงานกับ Oracle Database เบื้องต้น โดยโค้ดตัวอย่างนี้จะสอนการใช้งานต่าง ๆ เช่น การอ่านข้อมูล, เพิ่มข้อมูล, แก้ไขข้อมูล, และลบข้อมูลของผู้ใช้จากตาราง `employees` ในฐานข้อมูล Oracle

## คุณสมบัติ

- อ่านข้อมูลผู้ใช้ทั้งหมดจากฐานข้อมูล
- อ่านข้อมูลผู้ใช้ตาม ID
- เพิ่มผู้ใช้ใหม่
- แก้ไขข้อมูลผู้ใช้
- ลบผู้ใช้

## สิ่งที่ควรปรับหากเอาโปรเจกต์นี้ไปใช้งาน

### 1. การใช้ไฟล์ `.env` สำหรับข้อมูลการเชื่อมต่อฐานข้อมูล

เพื่อความปลอดภัยและความสะดวกในการจัดการข้อมูลที่สำคัญ เช่น ชื่อผู้ใช้ รหัสผ่าน และข้อมูลการเชื่อมต่อ คุณสามารถใช้ไฟล์ `.env` เพื่อเก็บข้อมูลเหล่านี้แทนการเขียนในโค้ดโดยตรง

สร้างไฟล์ `.env`:

```env
DB_USER=c##devuser
DB_PASSWORD=mypassword
DB_CONNECTSTRING=localhost:1521/XE
```

แก้ไขไฟล์ `index.js` ให้โหลดค่าจากไฟล์ `.env`:

```javascript
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTSTRING,
};
```

### 2. การแยกโมดูล

เพื่อให้โค้ดสะอาดและจัดการง่าย ควรแยกการทำงานออกเป็นโมดูล เช่นแยกฟังก์ชันเชื่อมต่อฐานข้อมูลและฟังก์ชันสำหรับการรันคำสั่ง SQL ออกเป็นไฟล์ต่างหาก

สร้างไฟล์ `db.js` สำหรับการเชื่อมต่อฐานข้อมูล:

```javascript
const oracledb = require("oracledb");
const dbConfig = require("./config"); // ไฟล์ config.js สำหรับข้อมูลเชื่อมต่อ

async function runQuery(query, binds = [], options = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, binds, options);
    return result;
  } catch (err) {
    console.error("Error during query execution:", err);
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = { runQuery };
```

ใน `index.js`:

```javascript
const { runQuery } = require("./db");
```

## ขั้นตอนการติดตั้งและการใช้งาน

### 1. ติดตั้ง Node.js และ OracleDB Instant Client

ตรวจสอบว่าคุณติดตั้ง Node.js และ OracleDB Instant Client ไว้แล้ว หากยังไม่ติดตั้งสามารถดูรายละเอียดเพิ่มเติมได้ที่:

- [Node.js](https://nodejs.org/)
- [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client.html)

### 2. ติดตั้งแพ็กเกจที่จำเป็น

รันคำสั่งด้านล่างเพื่อดาวน์โหลดแพ็กเกจทั้งหมดที่ต้องการ:

```bash
npm install
```

### 3. ตั้งค่าไฟล์ `.env`

สร้างไฟล์ `.env` ในโฟลเดอร์โปรเจกต์และใส่ข้อมูลเชื่อมต่อฐานข้อมูลตามตัวอย่าง:

```env
DB_USER=c##devuser
DB_PASSWORD=mypassword
DB_CONNECTSTRING=localhost:1521/XE
```

### 4. เริ่มต้นเซิร์ฟเวอร์

หลังจากตั้งค่าเรียบร้อยแล้ว ให้รันเซิร์ฟเวอร์โดยใช้คำสั่ง:

```bash
node index.js
```

API จะพร้อมใช้งานที่ `http://localhost:3000`

### 5. การใช้งาน API

- **GET** `/users` - อ่านข้อมูลผู้ใช้ทั้งหมด
- **GET** `/users/:id` - อ่านข้อมูลผู้ใช้ตาม ID
- **POST** `/users` - สร้างผู้ใช้ใหม่
- **PUT** `/users/:id` - แก้ไขข้อมูลผู้ใช้
- **DELETE** `/users/:id` - ลบผู้ใช้

## ข้อกำหนด

- Node.js
- Oracle Database
- OracleDB Instant Client

## การทดสอบ

คุณสามารถทดสอบ API ได้โดยใช้เครื่องมือเช่น [Postman](https://www.postman.com/) หรือใช้คำสั่ง `curl` ใน terminal

### ตัวอย่างคำสั่ง `curl`

- อ่านข้อมูลผู้ใช้ทั้งหมด:

```bash
curl http://localhost:3000/users
```

- สร้างผู้ใช้ใหม่:

```bash
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "John Doe", "email": "john@example.com"}'
```

## การอัปเดตและการดูแลรักษา

ควรตรวจสอบให้แน่ใจว่าแพ็กเกจที่ใช้อยู่เป็นเวอร์ชันล่าสุด และควรมีการสำรองฐานข้อมูลเสมอก่อนการทำการเปลี่ยนแปลงข้อมูล

---

โปรเจกต์นี้เหมาะสำหรับการเรียนรู้และทดลองเท่านั้น ไม่ควรใช้ในโปรดักชันโดยตรง
