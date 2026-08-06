/**
 * QueueFlow API
 *
 * Deploy this Apps Script project as a Web App (Execute as: Me,
 * Who has access: Anyone with the link). Bind it to the QueueFlow Google Sheet
 * or set Script Properties -> SPREADSHEET_ID to the target spreadsheet id.
 */
const SHEETS = {
  TICKETS: 'Tickets',
  EVENTS: 'Events',
  SETTINGS: 'Settings',
};

const TICKET_HEADERS = [
  'id', 'ticketCode', 'category', 'categoryLabel', 'priority', 'status',
  'businessDate', 'sequenceNo', 'issuedAt', 'calledAt', 'servingAt',
  'completedAt', 'skippedAt', 'servicePointId', 'operatorId', 'phone',
  'notes', 'updatedAt',
];

const EVENT_HEADERS = [
  'id', 'ticketId', 'type', 'fromStatus', 'toStatus', 'actorId',
  'metadata', 'createdAt',
];

const SETTINGS_HEADERS = ['key', 'value', 'updatedAt'];
const ACTIVE_STATUSES = ['waiting', 'called', 'serving', 'skipped'];
const CATEGORY_LABELS = { general: 'ผู้ป่วยทั่วไป', emergency: 'ผู้ป่วยฉุกเฉิน' };
const CATEGORY_PRIORITY = { general: 10, emergency: 100 };

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'health';
    return json_({ ok: true, data: handle_(action, parseJson_(e.parameter.payload || '{}')) });
  } catch (error) {
    return json_({ ok: false, error: error.message || String(error) });
  }
}

function doPost(e) {
  try {
    const request = parseJson_(e && e.postData ? e.postData.contents : '{}');
    const result = handle_(request.action || 'health', request.payload || {});
    return json_({ ok: true, data: result });
  } catch (error) {
    return json_({ ok: false, error: error.message || String(error) });
  }
}

function setup() {
  const spreadsheet = getSpreadsheet_();
  // When setup is run from a spreadsheet-bound Apps Script project,
  // persist the active spreadsheet id so the deployed Web App can open
  // the same file even though it has no active spreadsheet context.
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheet.getId());
  ensureSheet_(spreadsheet, SHEETS.TICKETS, TICKET_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.EVENTS, EVENT_HEADERS);
  ensureSheet_(spreadsheet, SHEETS.SETTINGS, SETTINGS_HEADERS);
  return { spreadsheetId: spreadsheet.getId(), sheets: Object.keys(SHEETS).map(key => SHEETS[key]) };
}

function setSpreadsheetId(spreadsheetId) {
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
  return { spreadsheetId: spreadsheetId };
}

function handle_(action, payload) {
  switch (action) {
    case 'health': return { service: 'queueflow-api', now: now_() };
    case 'setup': return setup();
    case 'getQueue': return queueSnapshot_();
    case 'createTicket': return withLock_(function() { return createTicket_(payload); });
    case 'callNext': return withLock_(function() { return callNext_(payload); });
    case 'callTicket': return withLock_(function() { return transitionTicket_(payload.ticketId, 'called', 'CALL_TICKET', ['waiting', 'skipped'], payload); });
    case 'skipTicket': return withLock_(function() { return transitionTicket_(payload.ticketId, 'skipped', 'SKIP_TICKET', ['called', 'serving'], payload); });
    case 'recallTicket': return withLock_(function() { return transitionTicket_(payload.ticketId, 'called', 'RECALL_TICKET', ['skipped'], payload); });
    case 'startService': return withLock_(function() { return transitionTicket_(payload.ticketId, 'serving', 'START_SERVICE', ['called'], payload); });
    case 'completeTicket': return withLock_(function() { return transitionTicket_(payload.ticketId, 'completed', 'COMPLETE_TICKET', ['called', 'serving'], payload); });
    case 'cancelTicket': return withLock_(function() { return transitionTicket_(payload.ticketId, 'cancelled', 'CANCEL_TICKET', ['waiting', 'skipped', 'called'], payload); });
    case 'getDashboard': return dashboard_();
    default: throw new Error('ไม่รู้จัก action: ' + action);
  }
}

function createTicket_(payload) {
  const category = String(payload.category || '').toLowerCase();
  if (!CATEGORY_LABELS[category]) throw new Error('ประเภทคิวไม่ถูกต้อง');
  const date = dateKey_();
  const tickets = readRecords_(SHEETS.TICKETS);
  const maxSequence = tickets.reduce(function(max, row) {
    return row.businessDate === date ? Math.max(max, Number(row.sequenceNo) || 0) : max;
  }, 0);
  const sequenceNo = maxSequence + 1;
  const timestamp = now_();
  const ticket = {
    id: Utilities.getUuid(),
    ticketCode: 'Q' + String(sequenceNo).padStart(3, '0'),
    category: category,
    categoryLabel: CATEGORY_LABELS[category],
    priority: CATEGORY_PRIORITY[category],
    status: 'waiting',
    businessDate: date,
    sequenceNo: sequenceNo,
    issuedAt: timestamp,
    calledAt: '',
    servingAt: '',
    completedAt: '',
    skippedAt: '',
    servicePointId: String(payload.servicePointId || ''),
    operatorId: String(payload.operatorId || ''),
    phone: String(payload.phone || ''),
    notes: String(payload.notes || ''),
    updatedAt: timestamp,
  };
  appendRecord_(SHEETS.TICKETS, TICKET_HEADERS, ticket);
  appendEvent_(ticket, 'TICKET_ISSUED', '', 'waiting', payload);
  return { ticket: ticket, queue: queueSnapshot_() };
}

function callNext_(payload) {
  const tickets = readRecords_(SHEETS.TICKETS).filter(function(row) {
    return row.businessDate === dateKey_() && row.status === 'waiting';
  });
  tickets.sort(queueComparator_);
  if (!tickets.length) throw new Error('ไม่มีคิวที่รอเรียก');
  return transitionTicket_(tickets[0].id, 'called', 'CALL_NEXT', ['waiting'], payload || {});
}

function transitionTicket_(ticketId, nextStatus, eventType, allowedStatuses, payload) {
  if (!ticketId) throw new Error('ต้องระบุ ticketId');
  const found = findRecord_(SHEETS.TICKETS, ticketId);
  if (!found) throw new Error('ไม่พบหมายเลขคิวนี้');
  const current = found.record.status;
  if (allowedStatuses.indexOf(current) === -1) throw new Error('ไม่สามารถเปลี่ยนสถานะจาก ' + current + ' เป็น ' + nextStatus);
  const timestamp = now_();
  const ticket = Object.assign({}, found.record, { status: nextStatus, updatedAt: timestamp });
  if (nextStatus === 'called') ticket.calledAt = timestamp;
  if (nextStatus === 'serving') ticket.servingAt = timestamp;
  if (nextStatus === 'completed') ticket.completedAt = timestamp;
  if (nextStatus === 'skipped') ticket.skippedAt = timestamp;
  updateRecord_(found, SHEETS.TICKETS, TICKET_HEADERS, ticket);
  appendEvent_(ticket, eventType, current, nextStatus, payload || {});
  return { ticket: ticket, queue: queueSnapshot_() };
}

function queueSnapshot_() {
  const today = dateKey_();
  const tickets = readRecords_(SHEETS.TICKETS).filter(function(row) {
    return row.businessDate === today && ACTIVE_STATUSES.indexOf(row.status) !== -1;
  });
  const sorted = tickets.slice().sort(queueComparator_);
  return {
    date: today,
    tickets: sorted,
    current: sorted.find(function(row) { return row.status === 'called' || row.status === 'serving'; }) || null,
    waiting: sorted.filter(function(row) { return row.status === 'waiting'; }),
    skipped: sorted.filter(function(row) { return row.status === 'skipped'; }),
  };
}

function dashboard_() {
  const today = dateKey_();
  const tickets = readRecords_(SHEETS.TICKETS).filter(function(row) { return row.businessDate === today; });
  const average = function(values) { return values.length ? Math.round(values.reduce(function(a, b) { return a + b; }, 0) / values.length * 10) / 10 : 0; };
  const waitMinutes = tickets.filter(function(row) { return row.issuedAt && row.calledAt; }).map(function(row) { return diffMinutes_(row.issuedAt, row.calledAt); });
  const serviceMinutes = tickets.filter(function(row) { return row.servingAt && row.completedAt; }).map(function(row) { return diffMinutes_(row.servingAt, row.completedAt); });
  return {
    date: today,
    total: tickets.length,
    waiting: tickets.filter(function(row) { return row.status === 'waiting'; }).length,
    skipped: tickets.filter(function(row) { return row.status === 'skipped'; }).length,
    emergency: tickets.filter(function(row) { return row.category === 'emergency'; }).length,
    completed: tickets.filter(function(row) { return row.status === 'completed'; }).length,
    cancelled: tickets.filter(function(row) { return row.status === 'cancelled'; }).length,
    averageWaitMinutes: average(waitMinutes),
    averageServiceMinutes: average(serviceMinutes),
  };
}

function queueComparator_(a, b) {
  const priority = (Number(b.priority) || 0) - (Number(a.priority) || 0);
  if (priority !== 0 && a.status === 'waiting' && b.status === 'waiting') return priority;
  return (Number(a.sequenceNo) || 0) - (Number(b.sequenceNo) || 0);
}

function appendEvent_(ticket, type, fromStatus, toStatus, payload) {
  appendRecord_(SHEETS.EVENTS, EVENT_HEADERS, {
    id: Utilities.getUuid(),
    ticketId: ticket.id,
    type: type,
    fromStatus: fromStatus,
    toStatus: toStatus,
    actorId: String(payload && payload.operatorId || ''),
    metadata: JSON.stringify(payload || {}),
    createdAt: now_(),
  });
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try { return callback(); } finally { lock.releaseLock(); }
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  const spreadsheet = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('ยังไม่ได้ตั้งค่า SPREADSHEET_ID');
  return spreadsheet;
}

function ensureSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function readRecords_(sheetName) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values.filter(function(row) { return row.some(function(value) { return value !== ''; }); }).map(function(row) {
    return headers.reduce(function(record, header, index) { record[header] = row[index] === null ? '' : String(row[index]); return record; }, {});
  });
}

function findRecord_(sheetName, id) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return null;
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);
  const idIndex = headers.indexOf('id');
  for (let index = 1; index < values.length; index += 1) {
    if (String(values[index][idIndex]) === String(id)) {
      const record = headers.reduce(function(result, header, column) { result[header] = values[index][column] === null ? '' : String(values[index][column]); return result; }, {});
      return { sheet: sheet, row: index + 1, headers: headers, record: record };
    }
  }
  return null;
}

function appendRecord_(sheetName, headers, record) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName) || ensureSheet_(getSpreadsheet_(), sheetName, headers);
  sheet.appendRow(headers.map(function(header) { return record[header] === undefined ? '' : record[header]; }));
}

function updateRecord_(found, sheetName, headers, record) {
  found.sheet.getRange(found.row, 1, 1, headers.length).setValues([headers.map(function(header) { return record[header] === undefined ? '' : record[header]; })]);
}

function dateKey_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Bangkok', 'yyyy-MM-dd'); }
function now_() { return new Date().toISOString(); }
function diffMinutes_(start, end) { return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 60000); }
function parseJson_(value) { try { return typeof value === 'string' ? JSON.parse(value || '{}') : (value || {}); } catch (error) { return {}; } }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
