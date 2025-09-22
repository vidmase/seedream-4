import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onAuthenticated: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  // Hardcoded pin - cannot be changed, deleted, or modified
  const CORRECT_PIN = '1256';
  const MAX_ATTEMPTS = 3;
  const LOCK_DURATION = 300; // 5 minutes in seconds

  useEffect(() => {
    // Check if user is locked out
    const lockEndTime = localStorage.getItem('lockEndTime');
    if (lockEndTime) {
      const now = Date.now();
      const lockEnd = parseInt(lockEndTime);
      if (now < lockEnd) {
        setIsLocked(true);
        setLockTimeRemaining(Math.ceil((lockEnd - now) / 1000));
      } else {
        localStorage.removeItem('lockEndTime');
        localStorage.removeItem('failedAttempts');
      }
    }

    // Load failed attempts
    const savedAttempts = localStorage.getItem('failedAttempts');
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  useEffect(() => {
    // Countdown timer for lock
    if (isLocked && lockTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            localStorage.removeItem('lockEndTime');
            localStorage.removeItem('failedAttempts');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLocked, lockTimeRemaining]);

  const handlePinChange = (index: number, value: string) => {
    if (isLocked) return;
    
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      setError('');

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`pin-${index + 1}`);
        nextInput?.focus();
      }

      // Check if pin is complete
      if (newPin.every(digit => digit !== '') && newPin.join('') === CORRECT_PIN) {
        // Clear any stored attempts
        localStorage.removeItem('failedAttempts');
        localStorage.removeItem('lockEndTime');
        onAuthenticated();
      } else if (newPin.every(digit => digit !== '')) {
        // Wrong pin
        handleWrongPin();
      }
    }
  };

  const handleWrongPin = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('failedAttempts', newAttempts.toString());

    if (newAttempts >= MAX_ATTEMPTS) {
      // Lock the user out
      const lockEndTime = Date.now() + (LOCK_DURATION * 1000);
      localStorage.setItem('lockEndTime', lockEndTime.toString());
      setIsLocked(true);
      setLockTimeRemaining(LOCK_DURATION);
      setError('Too many failed attempts. Access locked.');
    } else {
      setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
    }

    setIsShaking(true);
    setPin(['', '', '', '']);
    setTimeout(() => setIsShaking(false), 500);
    
    // Focus first input
    const firstInput = document.getElementById('pin-0');
    firstInput?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (isLocked) return;

    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-12"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent transform -rotate-12"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Seedream</h1>
          <p className="text-gray-300 text-lg">Image Editor</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Enter PIN to Continue</h2>
            <p className="text-gray-300">Please enter your 4-digit PIN to access the application</p>
          </div>

          {/* PIN Input */}
          <div className={`flex justify-center space-x-4 mb-6 ${isShaking ? 'animate-pulse' : ''}`}>
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLocked}
                className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 ${
                  isLocked 
                    ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                    : error 
                      ? 'bg-red-50 border-red-300 text-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : digit 
                        ? 'bg-green-50 border-green-300 text-green-600 focus:border-green-500 focus:ring-2 focus:ring-green-200'
                        : 'bg-white/20 border-white/30 text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50'
                } focus:outline-none`}
                placeholder="•"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center mb-4">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Lock Status */}
          {isLocked && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mb-3">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-red-400 font-medium">Access Temporarily Locked</p>
              <p className="text-gray-300 text-sm mt-1">Try again in {formatTime(lockTimeRemaining)}</p>
            </div>
          )}

          {/* Attempts Indicator */}
          {!isLocked && attempts > 0 && (
            <div className="flex justify-center space-x-2 mb-4">
              {[...Array(MAX_ATTEMPTS)].map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < attempts ? 'bg-red-400' : 'bg-gray-400/30'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-center text-gray-400 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secured Access
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Protected by secure authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
