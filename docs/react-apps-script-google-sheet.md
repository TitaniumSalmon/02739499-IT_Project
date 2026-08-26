# QueueFlow deployment: React + Apps Script + Google Sheets

## Google Sheet

สร้าง Google Sheet เปล่า 1 ไฟล์ แล้วเปิด Apps Script ที่ผูกกับไฟล์นั้น จากนั้นรัน `setup()` หนึ่งครั้งเพื่อสร้างชีตและบันทึก `SPREADSHEET_ID` ลงใน Script Properties อัตโนมัติ:

- `Tickets` — ข้อมูลคิวและสถานะปัจจุบัน
- `Events` — immutable event log สำหรับ audit และรายงาน
- `Settings` — ค่าตั้งค่าระบบ

ถ้า Apps Script ไม่ได้ผูกกับ Sheet ให้ตั้ง Script Property ชื่อ `SPREADSHEET_ID` หรือรัน `setSpreadsheetId('GOOGLE_SHEET_ID')`

## Apps Script

1. สร้าง Apps Script project และคัดลอก `appsscript/Code.gs` กับ `appsscript/appsscript.json`
2. รัน `setup()` และอนุญาตสิทธิ์ Google Sheets
3. Deploy > Manage deployments > Edit แล้วเลือก **New version** (หรือสร้าง New deployment) เพื่อให้ Web App ใช้โค้ดล่าสุด
4. Execute as: Me; Who has access: Anyone with the link
5. นำ Web App URL ไปใส่ใน `.env` ของ React:

```bash
VITE_API_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

React ส่ง body เป็น `text/plain` เพื่อหลีกเลี่ยง CORS preflight ของ Apps Script

## API actions

`health`, `getQueue`, `createTicket`, `callNext`, `callTicket`, `skipTicket`, `recallTicket`, `startService`, `completeTicket`, `cancelTicket`, `getDashboard`

การสร้างหมายเลขคิวและการเปลี่ยนสถานะใช้ `LockService` เพื่อป้องกัน race condition เมื่อมีหลายเครื่องขอคิวพร้อมกัน คิวฉุกเฉินมี priority สูงกว่าเฉพาะตอนเลือกคิวถัดไป ส่วนคิวที่ถูกข้ามจะคงอยู่ด้วยสถานะ `skipped` และเรียกกลับด้วย `recallTicket` ได้

## React

```bash
npm install
npm run dev
```

หากเจอ `EUNSUPPORTEDPROTOCOL workspace:*` หลังจากเคยใช้ `pnpm install` ให้ลบเฉพาะ dependency folder ที่ pnpm สร้างไว้ แล้วติดตั้งด้วย npm ใหม่:

```powershell
Remove-Item -Recurse -Force .\node_modules
npm install
npm run dev
```

สาเหตุคือ `node_modules` เดิมมี symlink ของ pnpm ซึ่ง npm ไม่สามารถอ่าน protocol `workspace:*` ได้ ตัว source code ไม่ได้มี dependency แบบ `workspace:*`

Routes ที่มีใน frontend:

- `#/` หน้าเริ่มต้นสำหรับเลือก กดบัตรคิว / หน้าแสดงคิว / เข้าสู่ระบบ
- `#/kiosk` ขอคิวและออกหมายเลขคิว เมื่อออกสำเร็จฟอร์มจะ reset เพื่อออกคิวใบถัดไปได้ทันที
- `#/display` จอแสดงคิวแบบ public (อัปเดตจาก Apps Script ทุก 15 วินาที)
- `#/login` เข้าสู่ระบบเจ้าหน้าที่
- `#/operator` หรือ `#/admin-queue` แผงเรียกคิวสำหรับเจ้าหน้าที่ (Figma node `12:101`)
- `#/dashboard` dashboard สถิติการให้บริการ (Figma node `23:12`)
- `#/report` หน้าสร้างรายงาน PDF / Excel / CSV (Figma node `38:2`)

การทำงานของคิวในหน้าเจ้าหน้าที่:

- `เรียกคิว` เลือกคิวรอที่มี priority สูงสุดก่อน (อุบัติเหตุแทรกคิวผู้ป่วยทั่วไปได้)
- `เสร็จสิ้น` ปิดคิวที่กำลังให้บริการ และเปิดให้เรียกคิวถัดไป
- `ข้ามคิว` ย้ายคิวปัจจุบันไปสถานะ `skipped`
- `เรียกคิวซ้ำ` เรียกคิวที่ถูกข้ามกลับมาให้บริการภายหลัง

ต้อง Deploy Apps Script เป็น version ล่าสุดทุกครั้งหลังแก้ `appsscript/Code.gs` ไม่เช่นนั้น Web App จะยังใช้โค้ดเวอร์ชันเก่า

หากข้อมูลเก่ามีหลายแถวเป็น `Q001` อยู่แล้ว ให้ Deploy โค้ดใหม่ก่อน แล้วรันฟังก์ชัน `repairTicketSequences()` จาก Apps Script editor หนึ่งครั้ง เพื่อเรียงเลขคิวของวันที่ปัจจุบันตามเวลาออกบัตรใหม่ ส่วนบัตรคิวที่ออกหลังจากนั้นจะได้เลขถัดไปโดยอัตโนมัติ

ถ้าไม่ตั้ง `VITE_API_URL` แอปจะเปิดเป็น local demo mode เพื่อทดสอบหน้าจอได้ แต่ production deployment ต้องตั้งค่า URL ของ Apps Script
