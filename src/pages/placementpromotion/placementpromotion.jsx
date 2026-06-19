/**
 * PLACEMENT & PROMOTION — Sheet helper functions
 * Add this content to the END of your existing Sheets.gs file
 * (same project as Code.gs, Sheets.gs, Seed.gs)
 *
 * Sheet structure (row 1 = headers, auto-created if missing):
 *
 * PLACEMENT_ASSESSMENT:
 *   admNo | name | reqClass | age | english | math | arabic | genKnow |
 *   concentration | instructions | communication | social | motor | emotional |
 *   discipline | respect | cooperation | responsiveness |
 *   academicScore | devScore | behScore | ageScore | tps | decision | risk |
 *   assessedBy | date
 *
 * PROMOTION_ASSESSMENT:
 *   admNo | name | currentClass | ca | exam | academicScore |
 *   daysPresent | totalDays | attPct | behRating | behScore |
 *   devGrowth | teacherEval | fps | decision | failFlag |
 *   assessedBy | date
 *
 * PARENT_OVERRIDES:
 *   admNo | name | context | recommendation | parentDecision | reason |
 *   signed | date | witness | approvedBy
 *
 * Both use admNo as the student key, matching Students sheet exactly.
 * No DOB/age lookup from Students — age is captured directly on the
 * placement record since Students has no DOB column.
 */

// ── SCORING LOGIC (server-side, mirrors the React tab calculation) ──────────

function computeAgeScore_(age, reqClass) {
  const secondary = ["SS3","SS2","SS1","JSS3","JSS2","JSS1"];
  const primary   = ["Pry6","Pry5","Pry4","Pry3","Pry2","Pry1","P1","P2","P3","P4","P5"];
  age = Number(age);
  if (secondary.indexOf(reqClass) >= 0) {
    return age >= 14 ? 100 : age >= 12 ? 80 : 60;
  } else if (primary.indexOf(reqClass) >= 0) {
    return age >= 6 ? 100 : age >= 5 ? 80 : 60;
  } else {
    return age >= 3 ? 100 : age >= 2 ? 70 : 40;
  }
}

function placementDecisionText_(tps) {
  if (tps >= 85) return { decision: "Full Placement", risk: "GREEN" };
  if (tps >= 70) return { decision: "Placement with Support", risk: "AMBER" };
  if (tps >= 50) return { decision: "Lower Class Recommended", risk: "AMBER" };
  return { decision: "Strongly Lower Class", risk: "RED" };
}

function promotionDecisionText_(fps, academicScore, attPct) {
  const critFail = Number(academicScore) < 40 || Number(attPct) < 60;
  if (critFail) return { decision: "REPEAT — Critical Fail Override", failFlag: "AUTO REPEAT" };
  if (fps >= 70) return { decision: "PROMOTE", failFlag: "OK" };
  if (fps >= 60) return { decision: "CONDITIONAL PROMOTE", failFlag: "OK" };
  if (fps >= 50) return { decision: "SUPPORT REQUIRED", failFlag: "OK" };
  return { decision: "REPEAT", failFlag: "OK" };
}


// ── PLACEMENT_ASSESSMENT ─────────────────────────────────────────────────────

function getPlacementAssessments() {
  const sh = sheetByName("PLACEMENT_ASSESSMENT");
  return rowsToObjects(sh);
}

/**
 * record expected shape from React tab:
 * {
 *   admNo, reqClass, age,
 *   english, math, arabic, genKnow,
 *   dev: [concentration, instructions, communication, social, motor, emotional],  // 1-5 each
 *   beh: [discipline, respect, cooperation, responsiveness],                       // 1-5 each
 *   assessedBy
 * }
 */
function savePlacementAssessment(record) {
  const sh = sheetByName("PLACEMENT_ASSESSMENT");

  // Look up student name from Students by admNo
  const studentsSh = sheetByName("Students");
  const studIdx = findRowIndex(studentsSh, "admNo", record.admNo);
  let name = record.name || "";
  if (studIdx > 0) {
    const studData = studentsSh.getDataRange().getValues();
    const headers = studData[0];
    const nameCol = headers.indexOf("name");
    name = studData[studIdx - 1][nameCol] || name;
  }

  const academicScore = Number((
    (Number(record.english) + Number(record.math) + Number(record.arabic) + Number(record.genKnow)) / 4
  ).toFixed(1));

  const dev = record.dev || [3,3,3,3,3,3];
  const beh = record.beh || [3,3,3,3];
  const devScore = Number(((dev.reduce((a,b)=>a+Number(b),0) / dev.length) * 20).toFixed(1));
  const behScore = Number(((beh.reduce((a,b)=>a+Number(b),0) / beh.length) * 25).toFixed(1));
  const ageScore = computeAgeScore_(record.age, record.reqClass);

  const tps = Number((
    (academicScore * 0.4) + (devScore * 0.3) + (behScore * 0.1) + (ageScore * 0.2)
  ).toFixed(1));

  const { decision, risk } = placementDecisionText_(tps);

  const obj = {
    admNo: record.admNo,
    name: name,
    reqClass: record.reqClass,
    age: record.age,
    english: record.english, math: record.math, arabic: record.arabic, genKnow: record.genKnow,
    concentration: dev[0], instructions: dev[1], communication: dev[2],
    social: dev[3], motor: dev[4], emotional: dev[5],
    discipline: beh[0], respect: beh[1], cooperation: beh[2], responsiveness: beh[3],
    academicScore: academicScore,
    devScore: devScore,
    behScore: behScore,
    ageScore: ageScore,
    tps: tps,
    decision: decision,
    risk: risk,
    assessedBy: record.assessedBy || "",
    date: new Date(),
  };

  appendObject(sh, obj);

  return { ok: true, tps, decision, risk, name };
}


// ── PROMOTION_ASSESSMENT ─────────────────────────────────────────────────────

function getPromotionAssessments() {
  const sh = sheetByName("PROMOTION_ASSESSMENT");
  return rowsToObjects(sh);
}

/**
 * record expected shape from React tab:
 * {
 *   admNo, ca, exam, daysPresent, totalDays,
 *   behRating, devGrowth, teacherEval, assessedBy
 * }
 */
function savePromotionAssessment(record) {
  const sh = sheetByName("PROMOTION_ASSESSMENT");

  const studentsSh = sheetByName("Students");
  const studIdx = findRowIndex(studentsSh, "admNo", record.admNo);
  let name = record.name || "";
  let currentClass = record.currentClass || "";
  if (studIdx > 0) {
    const studData = studentsSh.getDataRange().getValues();
    const headers = studData[0];
    const nameCol = headers.indexOf("name");
    const convCol = headers.indexOf("conv");
    const islCol  = headers.indexOf("isl");
    name = studData[studIdx - 1][nameCol] || name;
    currentClass = studData[studIdx - 1][convCol] || studData[studIdx - 1][islCol] || currentClass;
  }

  const academicScore = Number(((Number(record.ca) * 0.3) + (Number(record.exam) * 0.7)).toFixed(1));
  const attPct = record.totalDays > 0
    ? Number(((Number(record.daysPresent) / Number(record.totalDays)) * 100).toFixed(1))
    : 0;
  const behScore = Number(record.behRating) * 20;

  const fps = Number((
    (academicScore * 0.5) + (attPct * 0.15) + (behScore * 0.15) +
    (Number(record.devGrowth) * 0.1) + (Number(record.teacherEval) * 0.1)
  ).toFixed(1));

  const { decision, failFlag } = promotionDecisionText_(fps, academicScore, attPct);

  const obj = {
    admNo: record.admNo,
    name: name,
    currentClass: currentClass,
    ca: record.ca, exam: record.exam, academicScore: academicScore,
    daysPresent: record.daysPresent, totalDays: record.totalDays, attPct: attPct,
    behRating: record.behRating, behScore: behScore,
    devGrowth: record.devGrowth, teacherEval: record.teacherEval,
    fps: fps,
    decision: decision,
    failFlag: failFlag,
    assessedBy: record.assessedBy || "",
    date: new Date(),
  };

  appendObject(sh, obj);

  return { ok: true, fps, decision, failFlag, name };
}


// ── PARENT_OVERRIDES ──────────────────────────────────────────────────────────

function getParentOverrides() {
  const sh = sheetByName("PARENT_OVERRIDES");
  return rowsToObjects(sh);
}

function saveParentOverride(record) {
  const sh = sheetByName("PARENT_OVERRIDES");

  const studentsSh = sheetByName("Students");
  const studIdx = findRowIndex(studentsSh, "admNo", record.admNo);
  let name = record.name || "";
  if (studIdx > 0) {
    const studData = studentsSh.getDataRange().getValues();
    const headers = studData[0];
    const nameCol = headers.indexOf("name");
    name = studData[studIdx - 1][nameCol] || name;
  }

  const obj = {
    admNo: record.admNo,
    name: name,
    context: record.context,                  // "Admission" / "Promotion"
    recommendation: record.recommendation || "",
    parentDecision: record.parentDecision,     // "Accept" / "Override"
    reason: record.reason || "",
    signed: record.signed || "No",
    date: new Date(),
    witness: record.witness || "",
    approvedBy: record.approvedBy || "",
  };

  appendObject(sh, obj);
  return { ok: true, name };
}


// ── CLASS UPDATE AFTER PROMOTION ─────────────────────────────────────────────

const CLASS_LADDER_ = {
  "N1":"N2","N2":"N3","N3":"P1",
  "P1":"P2","P2":"P3","P3":"P4","P4":"P5","P5":"JSS1",
  "JSS1":"JSS2","JSS2":"JSS3","JSS3":"SS1","SS1":"SS2","SS2":"SS3",
};

function promoteStudentClass(admNo) {
  const sh = sheetByName("Students");
  const idx = findRowIndex(sh, "admNo", admNo);
  if (idx <= 0) return { ok:false, error: "Student not found: " + admNo };

  const data = sh.getDataRange().getValues();
  const headers = data[0];
  const convCol = headers.indexOf("conv");
  const currentClass = data[idx - 1][convCol];
  const nextClass = CLASS_LADDER_[currentClass];

  if (!nextClass) return { ok:false, error: "No ladder mapping for class: " + currentClass };

  sh.getRange(idx, convCol + 1).setValue(nextClass);
  return { ok:true, from: currentClass, to: nextClass };
}
