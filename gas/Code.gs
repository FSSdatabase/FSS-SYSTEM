/**
 * FOCUS ISLAMIC & WESTERN SCHOOL — MANAGEMENT SYSTEM
 * Google Apps Script Backend
 *
 * SETUP:
 * 1. Create a Google Sheet with tabs: Students, Staff, Settings, Attendance, DAAR, Fees, Scores
 * 2. Open Extensions > Apps Script
 * 3. Paste this file + Sheets.gs + Seed.gs
 * 4. Run `setupSheets()` once from Seed.gs to create headers and seed data
 * 5. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (or Anyone with Google account for more security)
 * 6. Copy the deployment URL into your React app's .env as VITE_GAS_URL
 */

const SHEET_ID = ""; // leave blank to use the bound spreadsheet, or paste a Sheet ID

function getSS() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function doPost(e) {
  let response;
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    switch (action) {
      // ── Students ──────────────────────────────────────
      case "getStudents":   response = getStudents(); break;
      case "saveStudent":   response = saveStudent(body.mode, body.student, body.origAdmNo); break;
      case "deleteStudent": response = deleteStudent(body.admNo); break;

      // ── Staff ─────────────────────────────────────────
      case "getStaff":   response = getStaff(); break;
      case "saveStaff":  response = saveStaff(body.mode, body.staff, body.origId); break;
      case "deleteStaff":response = deleteStaff(body.id); break;

      // ── Attendance ────────────────────────────────────
      case "getAttendance":  response = getAttendance(body.date, body.type, body.cls); break;
      case "saveAttendance": response = saveAttendance(body.date, body.type, body.cls, body.records); break;

      // ── DAAR ──────────────────────────────────────────
      case "getDAAR":       response = getDAAR(body); break;
      case "saveDAAREntry": response = saveDAAREntry(body.entry); break;

      // ── Fees ──────────────────────────────────────────
      case "getFees": response = getFees(body.cls, body.session); break;
      case "saveFee": response = saveFee(body.record); break;

      // ── Scores ────────────────────────────────────────
      case "getScores": response = getScores(body.cls, body.subject, body.term, body.session); break;
      case "saveScore": response = saveScore(body.record); break;

      // ── Settings ──────────────────────────────────────
      case "getSettings":  response = getSettings(); break;
      case "saveSettings": response = saveSettingsData(body.settings); break;

      default:
        return jsonOut({ success:false, error:`Unknown action: ${action}` });
    }

    return jsonOut({ success:true, data: response });
  } catch (err) {
    return jsonOut({ success:false, error: err.message });
  }
}

function doGet(e) {
  return jsonOut({ success:true, message:"FSS GAS API is running. Use POST requests." });
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
