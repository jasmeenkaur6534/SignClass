import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { DashboardProvider } from './context/DashboardContext.jsx';
import { SessionProvider } from './context/SessionContext.jsx';

import { JoinScreen } from './screens/JoinScreen.jsx';
import { Dashboard } from './screens/Dashboard.jsx';
import { LiveClass } from './screens/LiveClass.jsx';
import { RecapScreen } from './screens/RecapScreen.jsx';
import { ClassSummary } from './screens/ClassSummary.jsx';
import { ISLLearning } from './screens/ISLLearning.jsx';
import { TeacherView } from './screens/TeacherView.jsx';
import { TeacherVerifyScreen } from './screens/TeacherVerifyScreen.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <DashboardProvider>
          <SessionProvider>
            <Routes>
              <Route path="/" element={<JoinScreen />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live" element={<LiveClass />} />
              <Route path="/recap" element={<RecapScreen />} />
              <Route path="/summary" element={<ClassSummary />} />
              <Route path="/isl" element={<ISLLearning />} />
              <Route path="/teacher" element={<TeacherView />} />
              <Route path="/teacher/verify" element={<TeacherVerifyScreen />} />
            </Routes>
          </SessionProvider>
        </DashboardProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
