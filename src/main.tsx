import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/600.css';
import '@fontsource/archivo/800.css';
import './styles/tokens.css';
import './styles/app.css';
import { CAMPAIGNS } from './campaigns';
import NotFound from './NotFound';
import CampaignSite from './campaign/CampaignSite';
import AdminPage from './campaign/admin/AdminPage';
import RegistrationPage from './campaign/registration/RegistrationPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/thecrookedmoon" replace />} />
        <Route path="/thecrookedmoon" element={<CampaignSite />} />
        <Route path="/thecrookedmoon/admin" element={<AdminPage />} />
        <Route path="/thecrookedmoon/apply" element={<RegistrationPage />} />
        {CAMPAIGNS.map((c) => (
          <Route key={c.slug} path={c.path} element={c.element} />
        ))}
        {/* Old crossword URL — redirect so existing links/bookmarks keep working. */}
        <Route path="/crookedmoon/crossword" element={<Navigate to="/thecrookedmoon/activities/crossword" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
