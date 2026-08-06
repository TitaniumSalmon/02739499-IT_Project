const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiConfig = {
  url: API_URL,
  configured: Boolean(API_URL),
};

export async function apiRequest(action, payload = {}) {
  if (!API_URL) throw new Error('ยังไม่ได้ตั้งค่า VITE_API_URL');
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, payload }),
  });
  const body = await response.json();
  if (!body.ok) throw new Error(body.error || 'เกิดข้อผิดพลาดจาก API');
  return body.data;
}

export function demoQueue() {
  const now = new Date().toISOString();
  return {
    date: now.slice(0, 10),
    tickets: [
      { id: 'demo-1', ticketCode: 'Q001', category: 'general', categoryLabel: 'ผู้ป่วยทั่วไป', priority: 10, status: 'waiting', sequenceNo: 1, issuedAt: now },
      { id: 'demo-2', ticketCode: 'Q002', category: 'general', categoryLabel: 'ผู้ป่วยทั่วไป', priority: 10, status: 'waiting', sequenceNo: 2, issuedAt: now },
      { id: 'demo-3', ticketCode: 'Q003', category: 'emergency', categoryLabel: 'ผู้ป่วยฉุกเฉิน', priority: 100, status: 'waiting', sequenceNo: 3, issuedAt: now },
    ],
    current: null,
    waiting: [],
    skipped: [],
  };
}
