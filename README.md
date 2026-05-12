# LipVariety

Frontend: Vite + React + Tailwind + Supabase

## Scripts

```bash
# Run locally
npm run dev

# Lint source code (no UI changes)
npm run lint

# Production build (no UI changes)
npm run build

# Baseline gate for refactors (lint + build)
npm run check
```

## รอบ 0 — Baseline & Safety Net (ห้ามแตะ UI)

### Goal
ทำให้การ refactor รอบต่อไป “ปลอดภัย” และตรวจจับ regression ได้ โดย **ยังไม่เปลี่ยนหน้าตา UI**

### Acceptance (ต้องผ่านทั้งหมด)

#### 1) Commands
- [ ] `npm run dev` รันได้ (ไม่มี error)
- [ ] `npm run build` ผ่าน (ไม่มี error)
- [ ] `npm run check` ผ่าน (lint + build)

#### 2) Smoke checklist (manual)
เปิดหน้าเหล่านี้และตรวจว่า UI/พฤติกรรมหลัก “เหมือนเดิม”:

- [ ] **Home**: `/`
  - Navbar/CTA แสดงตามเดิม
  - กด “เริ่มควิซ” ไป Step1 ได้

- [ ] **Quiz flow**:
  - [ ] `/quiz/step1-skintone` เลือกค่า → ไป Step2 ได้
  - [ ] `/quiz/step2-undertone` เลือกค่า/กด “ไม่แน่ใจ” → ไป Step3 ได้
  - [ ] `/quiz/step3-lip` เลือกค่า → ไป Step4 ได้
  - [ ] `/quiz/step4-occasions` เลือกค่า → ไป Step5 ได้
  - [ ] `/quiz/step5-durability` เลือกค่า → ไป Results ได้

- [ ] **Results**: `/results`
  - แสดง Top 3 ได้
  - ปุ่มคัดลอก (ถ้ามี) ยังทำงาน

- [ ] **Admin login**: `/admin/login`
  - กรอกอีเมลและกดส่งลิงก์ (อย่างน้อยต้องไม่ error ที่หน้า)

- [ ] **Admin dashboard**: `/admin`
  - ถ้าไม่ได้เป็น admin ต้อง redirect ไป login ได้
  - ถ้าเป็น admin ต้องเข้าหน้า dashboard ได้

> หมายเหตุ: รอบ 0 นี้ “ห้ามแตะ UI” (ห้ามเปลี่ยน className/markup/ข้อความใน UI)

