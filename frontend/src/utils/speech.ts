/**
 * Speech synthesis utility to read status aloud using Web Speech API
 */

export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const stopSpeech = (): void => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  rate?: number;
  pitch?: number;
}

export const speakText = (text: string, options: SpeakOptions = {}): boolean => {
  if (!isSpeechSupported()) {
    console.warn('Speech synthesis not supported in this browser.');
    return false;
  }

  // Cancel any ongoing utterance
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.lang = 'en-US';

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return true;
};

export const formatComplaintSpeech = (complaint: {
  tracking_ref?: string;
  title?: string;
  status?: string;
  priority?: string;
  department?: string;
  locality?: string;
  address?: string;
  submitter_name?: string;
  guest_name?: string;
  resolution_notes?: string;
}): string => {
  const ref = complaint.tracking_ref || 'unassigned';
  const status = (complaint.status || 'submitted').replace(/_/g, ' ');
  const dept = complaint.department || 'Under departmental review';
  const priority = complaint.priority || 'Normal';
  const submitter = complaint.submitter_name || complaint.guest_name || 'Citizen';
  const location = complaint.locality || complaint.address || 'Location registered';
  const title = complaint.title || 'Public Service Request';

  let speech = `Complaint Update for Tracking ID ${ref}. `;
  speech += `Submitted by: ${submitter}. `;
  speech += `Subject: ${title}. `;
  speech += `Current Status is: ${status}. `;
  speech += `Priority level: ${priority}. `;
  speech += `Assigned Department: ${dept}. `;
  speech += `Location: ${location}. `;

  if (complaint.resolution_notes) {
    speech += `Resolution remarks: ${complaint.resolution_notes}. `;
  } else {
    speech += `The request is actively tracked in the civic workflow. `;
  }

  return speech;
};

// ─── Speech Recognition (Voice Dictation / Speech-to-Text) ────────────────────

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
};

export interface ListenOptions {
  lang?: string;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
  continuous?: boolean;
}

export const startListening = (options: ListenOptions): (() => void) | null => {
  if (!isSpeechRecognitionSupported()) {
    console.warn('Speech recognition not supported in this browser.');
    return null;
  }

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = true;
  recognition.lang = options.lang || 'en-IN';

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const transcript = finalTranscript || interimTranscript;
    if (transcript) {
      options.onResult(transcript.trim(), Boolean(finalTranscript));
    }
  };

  if (options.onError) {
    recognition.onerror = options.onError;
  }

  if (options.onEnd) {
    recognition.onend = options.onEnd;
  }

  try {
    recognition.start();
  } catch (err) {
    console.error('Failed to start speech recognition', err);
    if (options.onError) options.onError(err);
    return null;
  }

  return () => {
    try {
      recognition.stop();
    } catch {}
  };
};
