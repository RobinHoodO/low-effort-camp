/**
 * Google Apps Script Backend for Low Effort Camp
 * 
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Paste this code
 * 4. Deploy → New deployment → Web app
 * 5. Execute as: Me, Access: Anyone
 * 6. Copy the web app URL into the app's .env as VITE_GAS_URL
 */

const SHEET_NAMES = {
  ROSTER: 'Roster',
  SHIFTS: 'Shifts',
  POINTS: 'Points',
  SPACING: 'Spacing',
  KITCHEN: 'Kitchen',
};

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getAll') {
    return jsonResponse(getAllData());
  }
  
  return jsonResponse({ error: 'Unknown action' }, 400);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  try {
    switch (action) {
      case 'updateShift':
        return jsonResponse(updateShift(data));
      case 'updateAttendance':
        return jsonResponse(updateAttendance(data));
      case 'updateCamper':
        return jsonResponse(updateCamper(data));
      case 'updateKitchen':
        return jsonResponse(updateKitchen(data));
      case 'updateExtraPoints':
        return jsonResponse(updateExtraPoints(data));
      default:
        return jsonResponse({ error: 'Unknown action' }, 400);
    }
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function jsonResponse(data, statusCode) {
  statusCode = statusCode || 200;
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
}

function doOptions() {
  return ContentService.createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
}

function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  return {
    campers: getRoster(ss),
    shifts: getShifts(ss),
    points: getPoints(ss),
    spacing: getSpacing(ss),
    kitchen: getKitchen(ss),
  };
}

function getRoster(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.ROSTER);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map((row, idx) => ({
    id: idx + 1,
    name: row[0] || '',
    membership: row[1] === true || row[1] === 'TRUE' || row[1] === 'Yes',
    campFeePaid: row[2] === true || row[2] === 'TRUE' || row[2] === 'Yes',
    email: row[3] || '',
    phone: row[4] || '',
    dietary: row[5] || '',
    allergies: row[6] || '',
    transport: row[7] || '',
    spacingAdded: row[8] === true || row[8] === 'TRUE' || row[8] === 'Yes',
    attendance: {
      Wed15: normalizeAttendance(row[9]),
      Thu16: normalizeAttendance(row[10]),
      Fri17: normalizeAttendance(row[11]),
      Sat18: normalizeAttendance(row[12]),
      Sun19: normalizeAttendance(row[13]),
      Mon20: normalizeAttendance(row[14]),
      Tue21: normalizeAttendance(row[15]),
      Wed22: normalizeAttendance(row[16]),
      Thu23: normalizeAttendance(row[17]),
      Fri24: normalizeAttendance(row[18]),
      Sat25: normalizeAttendance(row[19]),
      Sun26: normalizeAttendance(row[20]),
      Mon27: normalizeAttendance(row[21]),
    }
  }));
}

function normalizeAttendance(val) {
  if (val === 'X' || val === true || val === 'TRUE' || val === 'confirmed') return 'confirmed';
  if (val === '?' || val === 'maybe') return 'maybe';
  return 'no';
}

function getShifts(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SHIFTS);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  return rows.map((row, idx) => ({
    id: 'shift-' + idx,
    category: row[0] || 'LNT',
    name: row[1] || '',
    days: {
      Monday: parseNames(row[2]),
      Tuesday: parseNames(row[3]),
      Wednesday: parseNames(row[4]),
      Thursday: parseNames(row[5]),
      Friday: parseNames(row[6]),
      Saturday: parseNames(row[7]),
      Sunday: parseNames(row[8]),
    },
    points: Number(row[9]) || 1,
    slots: row[10] ? Number(row[10]) : null,
    notes: row[11] || '',
  }));
}

function parseNames(val) {
  if (!val) return [];
  return String(val).split(',').map(s => s.trim()).filter(Boolean);
}

function getPoints(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.POINTS);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  const extra = {};
  rows.forEach(row => {
    const name = row[0];
    const additional = Number(row[5]) || 0;
    const reason = row[6] || '';
    if (name && (additional || reason)) {
      extra[name] = { additional, reason };
    }
  });
  return extra;
}

function getSpacing(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.SPACING);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1).map(row => ({
    who: row[0] || '',
    size: row[1] || '',
    type: row[2] || '',
    notes: row[3] || '',
  }));
}

function getKitchen(ss) {
  const sheet = ss.getSheetByName(SHEET_NAMES.KITCHEN);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  return data.slice(1).map(row => ({
    item: row[0] || '',
    size: row[1] || '',
    provider: row[2] || '',
    bringer: row[3] || '',
    notes: row[4] || '',
    confirmed: row[5] === true || row[5] === 'TRUE' || row[5] === 'Yes',
  }));
}

// --- Write operations ---

function updateShift(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.SHIFTS);
  const allData = sheet.getDataRange().getValues();
  const shiftIndex = Number(data.shiftId.replace('shift-', ''));
  const row = shiftIndex + 2; // +1 for header, +1 for 1-based
  
  const dayColMap = {
    'Monday': 3, 'Tuesday': 4, 'Wednesday': 5, 'Thursday': 6,
    'Friday': 7, 'Saturday': 8, 'Sunday': 9
  };
  const col = dayColMap[data.day];
  if (!col) return { error: 'Invalid day' };
  
  const current = allData[shiftIndex + 1][col - 1];
  let names = parseNames(current);
  
  if (data.add) {
    if (!names.includes(data.name)) names.push(data.name);
  } else {
    names = names.filter(n => n !== data.name);
  }
  
  sheet.getRange(row, col).setValue(names.join(', '));
  return { success: true };
}

function updateAttendance(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ROSTER);
  const row = data.camperId + 1; // +1 for header
  
  const dayColMap = {
    Wed15: 10, Thu16: 11, Fri17: 12, Sat18: 13, Sun19: 14,
    Mon20: 15, Tue21: 16, Wed22: 17, Thu23: 18, Fri24: 19,
    Sat25: 20, Sun26: 21, Mon27: 22
  };
  const col = dayColMap[data.day];
  
  let val = '';
  if (data.status === 'confirmed') val = 'X';
  if (data.status === 'maybe') val = '?';
  
  sheet.getRange(row, col).setValue(val);
  return { success: true };
}

function updateCamper(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.ROSTER);
  const row = data.camperId + 1;
  
  const fieldColMap = {
    email: 4, phone: 5, dietary: 6, allergies: 7, transport: 8
  };
  const col = fieldColMap[data.field];
  if (!col) return { error: 'Invalid field' };
  
  sheet.getRange(row, col).setValue(data.value);
  return { success: true };
}

function updateKitchen(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.KITCHEN);
  const row = data.index + 2;
  
  const fieldColMap = {
    item: 1, size: 2, provider: 3, bringer: 4, notes: 5, confirmed: 6
  };
  const col = fieldColMap[data.field];
  
  let val = data.value;
  if (data.field === 'confirmed') val = val ? 'Yes' : '';
  
  sheet.getRange(row, col).setValue(val);
  return { success: true };
}

function updateExtraPoints(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.POINTS);
  const allData = sheet.getDataRange().getValues();
  
  let row = -1;
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.name) {
      row = i + 1;
      break;
    }
  }
  
  if (row === -1) {
    row = allData.length + 1;
    sheet.getRange(row, 1).setValue(data.name);
  }
  
  sheet.getRange(row, 6).setValue(Number(data.additional) || 0);
  sheet.getRange(row, 7).setValue(data.reason || '');
  return { success: true };
}
