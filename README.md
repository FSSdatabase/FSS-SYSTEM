# FSS — Focus Islamic & Western School Management System

A full school management system for Focus Islamic & Western School (FIWS), Kaduna —
covering Conventional, Islamiyyah, Tahfeez, and Diploma sections.

**Stack:** React (Vite) + Google Apps Script + Google Sheets (database)

---

## ✅ What's Included (Phase 1)

| Module | Description |
|---|---|
| **Dashboard** | Live stats: enrollment, staff, fees collected, today's DAAR |
| **Student Registry** | All 268 real students, searchable/filterable by class, Islamiyyah level, type, status |
| **Attendance** | Daily Student & Staff attendance — Present/Absent/Late/Excused |
| **DAAR** | Daily Academic Activity Record — teachers log lessons taught, topics, homework, scheme adherence |
| **Fees** | Per-student fee tracking with discounts/waivers/concessions, by class |
| **Academics** | Conventional CA/Exam score entry with WAEC grading (A1–F9) |
| **Islamiyyah/Tahfeez Tracking** | Subject scores + Tahfeez memorization progress (Juz', Tajweed, recitation quality) |
| **Reports** | Report Cards, Class Broadsheets, Subject Performance Summaries |
| **Timetable** | Weekly class timetable viewer (JSS1 sample included) |
| **Manage** | Add/Edit/Delete students & staff, edit fee rates and session settings |

---

## 🚀 Quick Start (Local Development)

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Runs in **OFFLINE mode** with seeded real data
(268 students, 22 staff) — nothing persists between page reloads until GAS is connected.

---

## 🔌 Connect to Google Sheets (Live Data)

### Step 1 — Create the Google Sheet
Create a new Google Sheet. It can be empty — the seed script creates all tabs.

### Step 2 — Add the Apps Script
1. In the Sheet, go to **Extensions → Apps Script**
2. Delete the default `Code.gs` content
3. Create three files matching the `gas/` folder in this project:
   - `Code.gs`
   - `Sheets.gs`
   - `Seed.gs`
4. Copy the contents of each file from `gas/` into the matching Apps Script file

### Step 3 — Seed the data
1. In the Apps Script editor, select the `setupSheets` function from the dropdown
2. Click **Run** (▶️)
3. Authorize the script when prompted (it needs access to the Sheet)
4. Check your Google Sheet — you should now see tabs: `Students`, `Staff`, `Settings`, `Attendance`, `DAAR`, `Fees`, `Scores`
5. `Students` should have 268 rows, `Staff` should have 22 rows

### Step 4 — Deploy as Web App
1. Click **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone** (simplest) or **Anyone with Google account** (more secure — requires Google login)
5. Click **Deploy**, authorize again if asked
6. **Copy the Web App URL** (ends in `/exec`)

### Step 5 — Connect React app
1. Copy `.env.example` to `.env`
2. Paste your Web App URL:
   ```
   VITE_GAS_URL=https://script.google.com/macros/s/AKfycb.../exec
   ```
3. Restart `npm run dev` — the app should now show **"Live"** in the top bar instead of "Offline"

---

## 🌐 Deploy to GitHub Pages

### Option A — Automatic (GitHub Actions, recommended)
1. Push this repo to GitHub
2. Go to **Settings → Pages → Source → GitHub Actions**
3. Go to **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_GAS_URL`
   - Value: your GAS Web App URL
4. Push to `main` — the included workflow (`.github/workflows/deploy.yml`) builds and deploys automatically
5. Your site will be live at `https://<username>.github.io/fss-system/`

### Option B — Manual
```bash
npm install -D gh-pages   # already in package.json
npm run deploy
```

> **Note:** If hosting under a custom domain or subpath, edit `base` in `vite.config.js`.

---

## 📁 Project Structure

```
fss-system/
├── gas/                    # Google Apps Script backend (paste into Apps Script editor)
│   ├── Code.gs             # API router (doPost/doGet)
│   ├── Sheets.gs           # CRUD operations per data type
│   └── Seed.gs             # One-time setup: creates sheets + seeds 268 students, 22 staff
├── src/
│   ├── components/
│   │   ├── Layout.jsx       # Sidebar + topbar shell
│   │   ├── Modal.jsx         # Reusable modal + confirm dialog
│   │   └── shared/           # Buttons, badges, tables, form inputs
│   ├── context/
│   │   └── AppContext.jsx   # Global state + GAS sync
│   ├── data/
│   │   ├── constants.js      # Class names, fee rates, subjects, timetable
│   │   ├── students.js       # 268 real students (seed/fallback data)
│   │   └── staff.js           # 22 real staff (seed/fallback data)
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Students.jsx
│   │   ├── Attendance.jsx
│   │   ├── DAAR.jsx
│   │   ├── Fees.jsx
│   │   ├── Academics.jsx     # Conventional + Islamiyyah/Tahfeez tabs
│   │   ├── Reports.jsx       # Report Card / Broadsheet / Summary
│   │   ├── Timetable.jsx
│   │   └── Manage.jsx        # Add/Edit/Delete students, staff, settings
│   ├── services/
│   │   └── api.js            # All GAS fetch calls
│   ├── utils/
│   │   └── helpers.js        # Grading, formatting, status logic
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 👥 Real Data Loaded

- **268 students** across:
  - Conventional: N1–N3, P1–P5, JSS1–JSS3, SS1
  - Islamiyyah-only levels: Raudah 1A/1B/2/3, Pri 1A/1B/2/3/4/5 Islamiyyah, Mutawassid 1
  - Dual-enrolled students show both Conventional class AND Islamiyyah level
- **22 staff** with real names, roles (Head of Islamiyyah, Head of Mutawassid, Teachers, Care Givers), departments

## 💰 Fee Rates (2025/2026)

| Section | Termly Fee |
|---|---|
| Nursery 1–3, Primary 1–6 | ₦28,288 |
| JSS 1–3 | ₦29,000 |
| SS 1–3 | ₦30,000 |
| Diploma 1–2 | ₦45,000 (placeholder — update in Manage → Settings) |

All rates editable live from **Manage → Settings**.

---

## 🔮 Next Phases (Not Yet Built)

- Diploma section student/academic tracking (currently fee rates only — no DIP1/DIP2 students in dataset)
- SS2/SS3, JSS-specific Islamiyyah subject curricula
- Special Programs (CEL/CAL/CIS) full module
- Staff payroll & HR
- Parent-facing portal
- SMS/notification integration

---

## 🛠 Troubleshooting

**"Offline" badge won't go away:**
- Check `.env` has `VITE_GAS_URL` set correctly (must end in `/exec`)
- Restart dev server after editing `.env`
- Check GAS deployment access is set to "Anyone"

**Changes don't save:**
- Open the GAS deployment URL directly in browser — should show `{"success":true,"message":"FSS GAS API is running..."}`
- Check Apps Script **Executions** log for errors (left sidebar in Apps Script editor)

**CORS errors:**
- GAS Web Apps handle CORS automatically when deployed correctly. If issues persist, redeploy as a **new version** (Deploy → Manage deployments → Edit → New version)

---

## 📞 Support

Built for **Abubakar Shuaibu**, Director, Focus Islamic & Western School, Kaduna.
Maintained by the assigned ICT staff member with access to this repository.
