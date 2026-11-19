/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ArchiveProvider } from './context/ArchiveContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage, GotraPage, HistoryPage, ParbatsarPage } from './pages/HeritagePages';
import { FamilyTreePage } from './pages/FamilyTreePage';
import { BranchesPage, MemberProfilePage, MembersDirectoryPage } from './pages/MembersPages';
import { ResidenceMapPage } from './pages/ResidenceMapPage';
import { PhotoGalleryPage, VideoGalleryPage } from './pages/MediaPages';
import { ContactPage, EventsPage, TributesPage } from './pages/CommunityPages';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CustomPageView } from './pages/CustomPageView';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ArchiveProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/tree" element={<FamilyTreePage />} />
              <Route path="/gotra" element={<GotraPage />} />
              <Route path="/members" element={<MembersDirectoryPage />} />
              <Route path="/members/:id" element={<MemberProfilePage />} />
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/parbatsar" element={<ParbatsarPage />} />
              <Route path="/map" element={<ResidenceMapPage />} />
              <Route path="/photos" element={<PhotoGalleryPage />} />
              <Route path="/videos" element={<VideoGalleryPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/tributes" element={<TributesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/page/:slug" element={<CustomPageView />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ArchiveProvider>
    </ErrorBoundary>
  );
}
