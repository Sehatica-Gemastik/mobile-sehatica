import { useEffect, useState } from 'react';

export function useTypewriter(text: string, speedMs = 22, enabled = true) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      return;
    }

    setDisplayed('');
    if (!text) return;

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) clearInterval(timer);
    }, speedMs);

    return () => clearInterval(timer);
  }, [enabled, speedMs, text]);

  return displayed;
}
