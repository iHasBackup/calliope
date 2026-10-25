import { useEffect } from 'react';

/** The campaign site/admin pages cap at 1440px and center, so on wider
 * viewports the side margins show the plain <body> background. That
 * background is globally the crossword's light ground (tokens.css); these
 * dark-variant pages need it switched to the dark ground while mounted. */
export function useDarkBody() {
  useEffect(() => {
    // index.html sets this class before first paint on a fresh load; keep it
    // in sync when moving between dark and light pages inside the app.
    document.documentElement.classList.add('dark-ground');
    return () => {
      document.documentElement.classList.remove('dark-ground');
    };
  }, []);
}
