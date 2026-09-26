import { useEffect } from 'react';

/** The campaign site/admin pages cap at 1440px and center, so on wider
 * viewports the side margins show the plain <body> background. That
 * background is globally the crossword's light ground (tokens.css); these
 * dark-variant pages need it switched to the dark ground while mounted. */
export function useDarkBody() {
  useEffect(() => {
    document.body.style.background = 'var(--color-text)';
    return () => {
      document.body.style.background = '';
    };
  }, []);
}
