const DEFAULT_COUNTER = '2';

function getThaiVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find(voice => voice.lang?.toLowerCase().startsWith('th')) || null;
}

/** Announce a queue number through the browser's built-in text-to-speech. */
export function speakQueue(ticket, counter = DEFAULT_COUNTER) {
  if (typeof window === 'undefined' || !ticket?.ticketCode || !('speechSynthesis' in window)) return false;
  const Utterance = window.SpeechSynthesisUtterance;
  if (!Utterance) return false;
  const queueCode = String(ticket.ticketCode).replace(/^Q/i, '').split('').join(' ');
  const utterance = new Utterance(`ขอเชิญหมายเลขคิว ${queueCode} ที่ช่องบริการหมายเลข ${counter}`);
  utterance.lang = 'th-TH';
  utterance.rate = 0.7;
  utterance.pitch = 1;
  const voice = getThaiVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}
