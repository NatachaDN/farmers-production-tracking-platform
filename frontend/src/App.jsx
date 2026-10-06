import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './shared/components/Sidebar';
import { CycleActivitiesPage } from './features/crop/pages/CycleActivitiesPage';

function App() {
  return (
    <>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/crops/cycles/1/activities" replace />} />
        <Route path="/crops/cycles/:cycleId/activities" element={<CycleActivitiesPage />} />
        <Route path="/crops" element={<CycleActivitiesPage />} />
        <Route path="*" element={<CycleActivitiesPage />} />
      </Routes>
    </>
  );
}

export default App;
