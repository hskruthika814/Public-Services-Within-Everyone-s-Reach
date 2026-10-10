import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { isSpeechRecognitionSupported, startListening } from '../utils/speech';

interface SpeechInputButtonProps {
  onTranscript: (text: string) => void;
  lang?: string;
  label?: string;
  size?: 'sm' | 'md';
  mode?: 'append' | 'replace';
  currentValue?: string;
  className?: string;
}

export function SpeechInputButton({
  onTranscript,
  lang = 'en-IN',
  label = 'Voice Input',
  size = 'sm',
  mode = 'append',
  currentValue = '',
  className = '',
}: SpeechInputButtonProps) {
  const [listening, setListening] = useState(false);
  const stopListeningRef = useRef<(() => void) | null>(null);
  const supported = isSpeechRecognitionSupported();

  useEffect(() => {
    return () => {
      if (stopListeningRef.current) {
        stopListeningRef.current();
      }
    };
  }, []);

  const handleToggleListening = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!supported) {
      alert('Speech recognition is not supported in this browser. Please type directly or use Chrome / Edge.');
      return;
    }

    if (listening) {
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      setListening(false);
      return;
    }

    const initialText = currentValue;

    const stopFn = startListening({
      lang,
      onResult: (transcript, isFinal) => {
        if (mode === 'append') {
          const prefix = initialText ? `${initialText.trim()} ` : '';
          onTranscript(`${prefix}${transcript}`);
        } else {
          onTranscript(transcript);
        }
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setListening(false);
      },
      onEnd: () => {
        setListening(false);
        stopListeningRef.current = null;
      },
    });

    if (stopFn) {
      stopListeningRef.current = stopFn;
      setListening(true);
    }
  };

  if (!supported) {
    return null;
  }

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleToggleListening}
      aria-label={listening ? 'Stop recording voice' : `Click to dictate ${label}`}
      title={listening ? 'Listening... click to stop' : `Voice Dictation: Click to speak`}
      className={`inline-flex items-center gap-1.5 font-medium rounded transition-all select-none ${
        isSmall ? 'text-xs px-2.5 py-1' : 'text-sm px-3.5 py-1.5'
      } ${
        listening
          ? 'bg-red-600 text-white animate-pulse shadow-md ring-2 ring-red-300'
          : 'bg-gov-blue-pale text-gov-blue hover:bg-blue-100 border border-gov-border hover:border-gov-blue/50'
      } ${className}`}
    >
      {listening ? (
        <>
          <MicOff size={isSmall ? 13 : 16} className="text-white animate-bounce" />
          <span>Listening...</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </>
      ) : (
        <>
          <Mic size={isSmall ? 13 : 16} className="text-gov-blue" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export default SpeechInputButton;
