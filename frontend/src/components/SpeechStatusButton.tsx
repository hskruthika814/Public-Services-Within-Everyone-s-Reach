import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio } from 'lucide-react';
import { speakText, stopSpeech, isSpeechSupported, formatComplaintSpeech } from '../utils/speech';

interface SpeechStatusButtonProps {
  complaint: any;
  customText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export function SpeechStatusButton({
  complaint,
  customText,
  size = 'md',
  variant = 'primary',
  className = '',
}: SpeechStatusButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const supported = isSpeechSupported();

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (!supported) return null;

  const handleToggleSpeak = () => {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }

    const text = customText || formatComplaintSpeech(complaint);
    speakText(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary: speaking
      ? 'bg-amber-600 text-white hover:bg-amber-700 animate-pulse'
      : 'bg-gov-blue text-white hover:bg-blue-800 shadow-sm',
    secondary: speaking
      ? 'bg-amber-100 text-amber-900 border border-amber-300'
      : 'bg-gov-blue-pale text-gov-navy hover:bg-blue-100 border border-gov-border',
    outline: speaking
      ? 'border-2 border-amber-500 text-amber-700 bg-amber-50'
      : 'border border-gov-blue text-gov-blue hover:bg-blue-50 bg-white',
  };

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      className={`inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      title={speaking ? 'Click to stop reading' : 'Read status and details aloud'}
      aria-label={speaking ? 'Stop speech readout' : 'Read status aloud'}
    >
      {speaking ? (
        <>
          <VolumeX className="animate-bounce" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          <span>Stop Voice</span>
          <span className="flex h-2 w-2 relative ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
        </>
      ) : (
        <>
          <Volume2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          <span>Read Status Aloud</span>
        </>
      )}
    </button>
  );
}

export default SpeechStatusButton;
