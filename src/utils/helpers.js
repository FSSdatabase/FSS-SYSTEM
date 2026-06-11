export const naira = (n) =>
  "₦" + Number(n || 0).toLocaleString("en-NG");

export const fmtDate = (d) =>
  new Date((d || "") + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

export const nowTime = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export const today = () => new Date().toISOString().slice(0, 10);

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ── Nigerian WAEC grading ────────────────────────────────────────────────────
export const gradeInfo = (total) => {
  if (total == null || isNaN(total)) return null;
  if (total >= 75) return { g:"A1", r:"Excellent",  ar:"ممتاز",    c:"#15803d", bg:"#dcfce7" };
  if (total >= 70) return { g:"B2", r:"Very Good",  ar:"جيد جداً", c:"#1d4ed8", bg:"#dbeafe" };
  if (total >= 65) return { g:"B3", r:"Good",       ar:"جيد",      c:"#1d4ed8", bg:"#dbeafe" };
  if (total >= 60) return { g:"C4", r:"Credit",     ar:"جيد",      c:"#0f766e", bg:"#ccfbf1" };
  if (total >= 55) return { g:"C5", r:"Credit",     ar:"مقبول",    c:"#0f766e", bg:"#ccfbf1" };
  if (total >= 50) return { g:"C6", r:"Credit",     ar:"مقبول",    c:"#0f766e", bg:"#ccfbf1" };
  if (total >= 45) return { g:"D7", r:"Pass",       ar:"مقبول",    c:"#b45309", bg:"#fef3c7" };
  if (total >= 40) return { g:"E8", r:"Pass",       ar:"ضعيف",     c:"#b45309", bg:"#fef3c7" };
  return                   { g:"F9", r:"Fail",       ar:"ضعيف",     c:"#dc2626", bg:"#fee2e2" };
};

export const calcTotal = (sc) => {
  const vals = [sc.ca1, sc.ca2, sc.ca3, sc.exam].map(Number);
  return vals.some((v) => v === "" || isNaN(v)) ? null : vals.reduce((a, b) => a + b, 0);
};

export const getPosition = (arr, val) => arr.filter((v) => v > val).length + 1;

export const ordinal = (n) =>
  n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`;

export const feeStatus = (actualFee, discount, totalPaid, balance) => {
  if (actualFee === 0 && discount > 0) return { s:"WAIVER",    c:"#833c00", bg:"#fce4d6" };
  if (balance <= 0)                    return { s:"CLEARED",   c:"#15803d", bg:"#dcfce7" };
  if (totalPaid > 0)                   return { s:"PARTIAL",   c:"#b45309", bg:"#fef3c7" };
  return                                      { s:"DEFAULTER", c:"#dc2626", bg:"#fee2e2" };
};

// attendance status cycle
export const S_CYCLE = ["P", "A", "L", "E"];
export const S_LABEL = { P:"Present", A:"Absent", L:"Late", E:"Excused" };
export const S_BG    = { P:"#dcfce7", A:"#fee2e2", L:"#fef3c7", E:"#dbeafe" };
export const S_FG    = { P:"#15803d", A:"#dc2626", L:"#d97706", E:"#2563eb" };
