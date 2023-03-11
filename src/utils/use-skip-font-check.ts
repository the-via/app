import {useCallback, useEffect, useState} from 'react';

export function useSkipFontCheck() {
  const [shouldSkipFontCheck, setShouldSkipFontCheck] = useState(false);
  const allowFontCheck = useCallback(() => {
    setShouldSkipFontCheck(false);
  }, []);
  const skipFontCheck = useCallback(() => {
    setShouldSkipFontCheck(true);
  }, []);
  useEffect(() => {
    document.fonts.load('Fira Sans').then(allowFontCheck, skipFontCheck);
  }, []);
  return shouldSkipFontCheck;
}
