let audioContext;
try {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
  console.warn("Web Audio API is not supported by this browser.");
}

// Function to play a simple "ping" sound
export const playNotificationSound = () => {
  if (!audioContext) return;

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A high-pitched note (A5)
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
};
