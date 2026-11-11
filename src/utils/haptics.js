/**
 * Haptic & Audio Feedback Utility for Werewolf GM
 * Cross-platform support for Mobile (iOS Safari & Android PWA)
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a synthesized tone or chime
 */
function playTone(freq, type = 'sine', duration = 0.1, gainValue = 0.15) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silent fail on unsupported audio
  }
}

/**
 * Main trigger function for haptic and audio feedback
 * @param {'tap' | 'confirm' | 'danger' | 'timer-end' | 'timer-tick'} type 
 */
export function triggerHaptic(type = 'tap') {
  if (typeof window === 'undefined') return;

  // 1. Hardware vibration API
  if (navigator.vibrate) {
    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(15);
          break;
        case 'confirm':
          navigator.vibrate([25, 40, 35]);
          break;
        case 'danger':
          navigator.vibrate([70, 40, 90]);
          break;
        case 'timer-tick':
          navigator.vibrate(20);
          break;
        case 'timer-end':
          // Urgent triple buzz alarm
          navigator.vibrate([350, 150, 350, 150, 600, 200, 600]);
          break;
        default:
          navigator.vibrate(20);
      }
    } catch (e) {}
  }

  // 2. Audio cue (Tactile Audio for iPhone / iOS WebKit where vibrate might be restricted)
  try {
    switch (type) {
      case 'tap':
        playTone(900, 'sine', 0.03, 0.05);
        break;
      case 'confirm':
        playTone(523.25, 'sine', 0.08, 0.12);
        setTimeout(() => playTone(659.25, 'sine', 0.12, 0.12), 60);
        break;
      case 'danger':
        playTone(180, 'triangle', 0.2, 0.2);
        break;
      case 'timer-tick':
        playTone(1200, 'sine', 0.02, 0.04);
        break;
      case 'timer-end': {
        // Dramatic Gothic gong / alarm sequence
        playTone(440, 'triangle', 0.4, 0.25);
        setTimeout(() => playTone(554.37, 'triangle', 0.4, 0.25), 180);
        setTimeout(() => playTone(659.25, 'triangle', 0.6, 0.3), 360);
        setTimeout(() => playTone(880, 'sine', 0.8, 0.35), 580);
        break;
      }
      default:
        break;
    }
  } catch (e) {}
}

export default triggerHaptic;
