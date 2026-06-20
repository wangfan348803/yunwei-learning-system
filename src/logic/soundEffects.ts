// Web Audio and Speech Synthesis sound manager

let audioCtx: AudioContext | null = null;

interface WebKitAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextCtor = window.AudioContext || (window as WebKitAudioWindow).webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error('Web Audio API is not supported in this browser.');
    }
    audioCtx = new AudioContextCtor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Play a subtle, clean click sound
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.error('Failed to play click sound:', e);
  }
}

// 2. Play a pleasant success chime (for correct answers)
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play an ascending triad chime
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0.12, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + idx * 0.1 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.25);
    });
  } catch (e) {
    console.error('Failed to play success sound:', e);
  }
}

// 3. Play a subtle failure buzzer (for wrong answers)
export function playFailureSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a dual descending tone
    const notes = [293.66, 220.00]; // D4, A3
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      
      gain.gain.setValueAtTime(0.1, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + idx * 0.12 + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.3);
    });
  } catch (e) {
    console.error('Failed to play failure sound:', e);
  }
}

// 4. TTS Read Aloud function using window.speechSynthesis
export function speakText(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported in this browser.');
    return;
  }

  try {
    // Cancel any ongoing speech to prevent queues backing up
    window.speechSynthesis.cancel();

    // Clean up markdown/extra punctuation for natural TTS reading
    const cleanText = text
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      .replace(/_/g, '')
      .replace(/^\s*-\s+/gm, '')  // Only strip Markdown list markers (- ), preserve command flags like -lntp
      .replace(/\[/g, '')
      .replace(/]/g, '')
      .replace(/&&/g, '并且')
      .replace(/\|\|/g, '或者');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Try to get a high-quality Chinese voice
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => 
      v.lang.includes('zh-CN') || 
      v.lang.includes('zh-HK') || 
      v.lang.includes('zh-TW') || 
      v.lang.includes('zh')
    );
    
    if (zhVoice) {
      utterance.voice = zhVoice;
    }
    
    utterance.rate = 1.05; // slightly faster than default for natural feel
    utterance.pitch = 1.0;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('TTS speech failed:', e);
  }
}

// 5. Stop all active TTS speech
export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
