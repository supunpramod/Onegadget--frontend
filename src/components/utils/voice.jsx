export function speakText(text) {
  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";       // Change language if needed
  utterance.rate = 1;             // Speed of speech
  utterance.pitch = 1;            // Voice pitch
  window.speechSynthesis.speak(utterance);
}
