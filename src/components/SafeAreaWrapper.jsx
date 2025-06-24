// src/components/SafeAreaWrapper.jsx
import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

const SafeAreaWrapper = ({ children }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [bgColor, setBgColor] = useState('#fdfaf7'); // default fallback

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsIOS(platform === 'ios');

    // Read CSS variable from root
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVar = rootStyles.getPropertyValue('--bg-header-footer');
    if (cssVar) {
      setBgColor(cssVar.trim());
    }
  }, []);

  return (
    <div
      style={{
        paddingTop: isIOS ? 'calc(env(safe-area-inset-top) + 13px)' : 0,
        backgroundColor: bgColor,
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  );
}; 

export default SafeAreaWrapper;