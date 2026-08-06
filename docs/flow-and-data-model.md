# QueueFlow — Figma audit and production data model

อ้างอิงจาก Figma file `kNLIsafC1KMhTEb1AAm3so` (Page 1) โดยรวมทั้งหน้าสำหรับผู้รับบริการ, เจ้าหน้าที่, จอ kiosk/display และ back office analytics/reporting

## 1. Page inventory

Figma มี artboard หลัก 24 รายการ (ไม่นับ component, image และ section ที่เป็น asset/reference) แบ่งเป็น 5 กลุ่มดังนี้

### A. Public queue flow

| Figma node | Canonical route | ชื่อหน้า | รายละเอียดด้านใน |
|---|---|---|---|
| `2:902` | `/queue/display` | จอแสดงคิวบริการ | Hero ของสถานพยาบาล, grid ช่องบริการ 9 ช่อง, หมายเลขคิว Q001–Q009, ประเภทผู้ป่วย, ปุ่มเรียกคิว/ยกเลิก, footer policy |
| `4:1402` | `/queue/operator` | แผงเจ้าหน้าที่จัดการคิว | รายการคิวแบบ 3 คอลัมน์, หมวดกรณีพิเศษ/ผู้ป่วยทั่วไป/อุบัติเหตุ, ปุ่มเรียกคิวและยกเลิก, สถานะปัจจุบัน |
| `4:1622` | `/queue/operator/special` | ยืนยันคิวกรณีพิเศษ | แสดงประเภทกรณีพิเศษ, หมายเลข Q001, ปุ่มย้อนกลับ และเสร็จสิ้น |
| `2:594` | `/queue/operator/patient` | ยืนยันประเภทผู้ป่วยทั่วไป | แสดงประเภทผู้ป่วยทั่วไป, ปุ่มย้อนกลับ และยืนยัน |
| `2:869` | `/queue/ticket` | ออกหมายเลขคิว | แสดง “หมายเลขของท่าน”, หมายเลข Q974, ปุ่มเสร็จสิ้นกลับจอหลัก |
| `2:269` | `/queue/confirm` | Confirm Your Visit | หมวด Financial Advising, เวลารอประมาณ 18 นาที, คนก่อนหน้า 4 คน, เบอร์โทร SMS optional, ยืนยันเข้าคิว/เลือกบริการใหม่, terms และ privacy |

### B. Kiosk / patient self-service

| Figma node | Canonical route | ชื่อหน้า | รายละเอียดด้านใน |
|---|---|---|---|
| `17:775` | `/kiosk/category` | Press the queue — ว่าง | เลือกหมวด ผู้ป่วยทั่วไป หรือ อุบัติเหตุ, ปุ่มยืนยันยังไม่ active, header “From Admin” |
| `17:2085` | `/kiosk/category/general` | Press the queue — เลือกผู้ป่วยทั่วไป | state ที่เลือกผู้ป่วยทั่วไป, ปุ่มยืนยันและย้อนกลับ |
| `17:3033` | `/kiosk/category/emergency` | Press the queue — เลือกอุบัติเหตุ | state ที่เลือกอุบัติเหตุ, ปุ่มยืนยันและย้อนกลับ |
| `17:3350` | `/kiosk/ticket/general` | Your Queue — ผู้ป่วยทั่วไป | วันที่, badge ประเภท, หมายเลข Q001, จำนวนคิวก่อนหน้า, ข้อความให้รอสัญญาณ และกลับหน้าจอหลัก |
| `17:3664` | `/kiosk/ticket/emergency` | Your Queue — อุบัติเหตุ | โครงสร้างเดียวกับหน้าผู้ป่วยทั่วไป แต่ badge เป็นอุบัติเหตุ |

### C. Queue operation and public display

| Figma node | Canonical route | ชื่อหน้า | รายละเอียดด้านใน |
|---|---|---|---|
| `12:101` | `/staff/queue` | Admin — Call the queue number | sidebar Queue/Dashboard/Report, current ticket Q001, ปุ่มเรียกคิว/เสร็จสิ้น/เรียกซ้ำ, upcoming queue Q002–Q005 พร้อมสถานะ |
| `139:348` | `/staff/queue/live` | Admin — Call the queue number (live state) | current tickets หลายช่อง, upcoming Q072–Q075, panel คิวที่เรียกไปแล้ว Q068–Q070 และเวลาอัปเดต |
| `62:2` | `/display/overview` | จอแสดงผลภาพรวม | ช่องบริการ 10 ช่อง, จำนวนผู้รอในแต่ละช่อง, รายการคิวถัดไป, ภาพประกอบสถานพยาบาล |
| `132:17` | `/display/board/empty` | จอแสดงผลช่องบริการ — empty state | หัวข้อช่องบริการและคอลัมน์ว่างสำหรับแต่ละ service point |
| `138:44` | `/display/board/empty-alt` | จอแสดงผลช่องบริการ — alternate empty state | empty board อีก variant สำหรับ layout/display configuration |
| `132:409` | `/display/board/live` | จอแสดงผลช่องบริการ — live state | คอลัมน์หมายเลขบริการ 3–7, คิว Q011–Q017 ที่ถูกจัดลงช่องบริการ และรายการคิวที่เรียกเข้าใช้บริการ |

### D. Legacy staff portal

| Figma node | Canonical route | ชื่อหน้า | รายละเอียดด้านใน |
|---|---|---|---|
| `38:446` | `/auth/login` | เข้าสู่ระบบ | username, password, ปุ่ม Login, background ภาพสถานพยาบาล |
| `55:314` | `/auth/register` | ลงทะเบียน | username, password, ยืนยันรหัสผ่าน, ปุ่มลงทะเบียน, link มีบัญชีอยู่แล้ว |
| `23:12` | `/staff/dashboard` | แดชบอร์ด | chart ระยะเวลา/ปริมาณผู้ใช้แยกจุดบริการ, hourly time-window chart, KPI ผู้ใช้บริการ/เวลารอ/เวลาบริการ |
| `38:2` | `/staff/reports` | Report | ประเภทรายงานสรุปภาพรวม/รายบุคคล, date range, export PDF/Excel/CSV และภาพประกอบ |

### E. New back office analytics and reporting

| Figma node | Canonical route | ชื่อหน้า | รายละเอียดด้านใน |
|---|---|---|---|
| `26:736` | `/admin/dashboard` | HealthFlow Admin Dashboard | global search, sidebar, KPI total visitors/avg wait/avg service/stations, service-volume chart, hourly heatmap, station-efficiency table, export |
| `23:375` | `/admin/reports` | Monthly Service Summary | KPI monthly visitors/visit duration/busiest zone/satisfaction, service volume, avg duration by zone, peak traffic trend, monthly stats table, Export CSV, success toast |
| `55:7` | `/admin/reports/export` | Enterprise Report Builder | เลือกประเภทรายงาน, date range, format PDF/Excel/CSV, data preview, security/compliance acknowledgement, generate/download report |

`Section 1`, `Section 4` และ symbol/component ต่าง ๆ เป็น reference assets/variants ไม่ใช่ route ที่ผู้ใช้ต้องเปิดโดยตรง

## 2. State and permission model

- `patient`: ขอคิว, ดูหมายเลขคิวของตัวเอง, รับ notification, ยกเลิกคิวของตัวเอง
- `operator`: เรียก/เรียกซ้ำ/เสร็จสิ้น/ยกเลิกคิวใน service point ที่ได้รับมอบหมาย
- `admin`: จัดการ facility, service point, category, user และดูข้อมูลทุกช่องบริการ
- `analyst`: อ่าน dashboard/report และสร้าง export โดยแก้ไข queue state ไม่ได้
- `display`: read-only token สำหรับจอแสดงผล และรับ real-time update ผ่าน WebSocket/SSE

Queue state ที่ต้องรองรับจริง: `waiting → called → serving → completed`, รวม `cancelled`, `no_show`, `skipped`, `transferred` และ `expired`

## 3. Production database (PostgreSQL)

### Tenancy and access

- `organizations(id, name, slug, timezone, status, created_at, updated_at)` — รองรับหลายมหาวิทยาลัย/โรงพยาบาล
- `facilities(id, organization_id, name, code, address, timezone, status, created_at, updated_at)`
- `users(id, organization_id, facility_id, username, email, password_hash, display_name, status, last_login_at, created_at, updated_at)`
- `roles(id, key, name)` — `patient`, `operator`, `admin`, `analyst`, `display`
- `user_roles(user_id, role_id, facility_id, created_at)`
- `sessions(id, user_id, refresh_token_hash, expires_at, revoked_at, created_at, last_seen_at)`

### Queue configuration

- `service_categories(id, facility_id, code, name_th, name_en, priority, color, is_active, created_at, updated_at)`
- `service_points(id, facility_id, code, name_th, name_en, floor, status, display_order, is_active, created_at, updated_at)`
- `service_point_categories(service_point_id, category_id, priority, is_active)`
- `queue_sequences(id, facility_id, category_id, business_date, next_number, prefix, reset_policy, updated_at)`
- `display_boards(id, facility_id, name, board_key, layout, is_active, last_heartbeat_at, created_at)`
- `display_board_points(display_board_id, service_point_id, display_order)`

### Patient and ticket lifecycle

- `visitors(id, facility_id, phone_e164, phone_hash, consent_sms_at, preferred_language, created_at, updated_at)` — เก็บ phone ที่เข้ารหัสและ hash สำหรับ lookup; ไม่บังคับสร้าง account
- `queue_tickets(id, facility_id, category_id, service_point_id, visitor_id, business_date, sequence_no, ticket_code, priority, status, issued_at, called_at, serving_at, completed_at, cancelled_at, expires_at, metadata jsonb, created_at, updated_at)`
- `queue_events(id, ticket_id, actor_user_id, event_type, from_status, to_status, service_point_id, payload jsonb, occurred_at)` — immutable audit/event stream
- `queue_calls(id, ticket_id, service_point_id, operator_id, call_number, called_at, acknowledged_at, completed_at, outcome, created_at)`
- `ticket_assignments(id, ticket_id, service_point_id, assigned_by, assigned_at, unassigned_at, reason)`

### Notifications and reporting

- `notification_preferences(id, visitor_id, channel, destination, verified_at, enabled, created_at, updated_at)`
- `notifications(id, ticket_id, visitor_id, channel, template_key, provider_message_id, status, sent_at, delivered_at, failure_reason, created_at)`
- `report_definitions(id, organization_id, key, name, query_config jsonb, allowed_roles, created_at, updated_at)`
- `report_jobs(id, requested_by, facility_id, definition_id, filters jsonb, format, status, storage_key, started_at, finished_at, error_message, created_at)`
- `audit_logs(id, organization_id, actor_user_id, action, entity_type, entity_id, ip_address, user_agent, payload jsonb, created_at)`

### Integrity and performance rules

1. ออกเลขคิวใน transaction เดียวกับการสร้าง `queue_tickets` โดย lock `queue_sequences` (ห้ามใช้ MAX+1)
2. Unique constraint: `(facility_id, category_id, business_date, sequence_no)` และ `(facility_id, ticket_code, business_date)`
3. Partial index สำหรับ ticket ที่ active (`waiting`, `called`, `serving`) และ index สำหรับ `(service_point_id, status, created_at)`
4. ทุกการเปลี่ยนสถานะต้องเขียน `queue_events` และ `audit_logs` ใน transaction เดียวกัน
5. ใช้ UTC ใน storage และแปลงเป็น timezone ของ facility ตอนแสดงผล
6. ลบข้อมูลผู้ป่วยแบบ hard delete ไม่ได้จนกว่าจะผ่าน retention policy; ใช้ anonymization สำหรับ PII และเก็บรายงานแบบ aggregate

## 4. Backend/API ที่ต้องรองรับ

- Auth: login, register, refresh, logout, password reset, role/facility authorization
- Queue: issue ticket, list waiting, call next, recall, start service, complete, cancel, skip, transfer, get ticket status
- Display: board snapshot, display heartbeat, real-time ticket updates
- Notifications: opt-in SMS, queue-called, almost-turn, cancellation/failure retry
- Analytics: KPI summary, hourly traffic, service-point efficiency, monthly report, export job status/download

การ implement ถัดไปจะใช้ transaction-safe PostgreSQL + WebSocket/SSE สำหรับ live queue และ background worker สำหรับ notification/report export เพื่อให้ทำงานได้จริงใน production ไม่ใช่แค่ mock state ใน browser
