import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './shared/components/Sidebar';
import { HarvestPage } from './features/crop/pages/HarvestPage';

function App() {
  return (
    <>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/crops/cycles/1/harvest" replace />} />
        <Route path="/crops/cycles/:cycleId/harvest" element={<HarvestPage />} />
        <Route path="*" element={<HarvestPage />} />
      </Routes>
    </>
  );
}

export default App;
