import type { ReactElement } from 'react';
import CrookedMoonCrossword from './App';

export interface Campaign {
  slug: string;
  path: string;
  label: string;
  element: ReactElement;
}

// Add a new campaign here when it exists — one entry, one route.
export const CAMPAIGNS: Campaign[] = [
  {
    slug: 'crookedmoon',
    path: '/thecrookedmoon/activities/crossword',
    label: 'The Crooked Moon',
    element: <CrookedMoonCrossword />,
  },
];
