import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialDashboardData } from '../mock/mockDashboard.js';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [dashboardData, setDashboardData] = useState(() => {
    const saved = localStorage.getItem('signclass_dashboard_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return initialDashboardData;
  });

  useEffect(() => {
    localStorage.setItem('signclass_dashboard_data', JSON.stringify(dashboardData));
  }, [dashboardData]);

  const toggleAssignment = (assignmentId) => {
    setDashboardData(prev => ({
      ...prev,
      assignments: prev.assignments.map(a =>
        a.id === assignmentId ? { ...a, completed: !a.completed } : a
      )
    }));
  };

  const mergeSessionActionItems = (newActionItems) => {
    if (!newActionItems || newActionItems.length === 0) return;

    setDashboardData(prev => {
      const updatedDeadlines = [...prev.deadlines];
      const updatedAssignments = [...prev.assignments];

      newActionItems.forEach(item => {
        if (item.type === 'deadline') {
          if (!updatedDeadlines.some(d => d.id === item.id)) {
            updatedDeadlines.unshift({
              id: item.id,
              title: item.title,
              subject: 'Data Structures',
              dueDate: item.dueDate,
              dueLabel: item.dueLabel || 'Upcoming',
              urgency: 'soon',
              sourceTimestamp: item.sourceTimestamp,
              sourceSession: 'cs204a'
            });
          }
        } else if (item.type === 'assignment') {
          if (!updatedAssignments.some(a => a.id === item.id)) {
            updatedAssignments.unshift({
              id: item.id,
              title: item.title,
              subject: 'Data Structures',
              capturedDate: 'Just now (Live Class)',
              completed: false
            });
          }
        }
      });

      return {
        ...prev,
        deadlines: updatedDeadlines,
        assignments: updatedAssignments
      };
    });
  };

  return (
    <DashboardContext.Provider value={{
      dashboardData,
      toggleAssignment,
      mergeSessionActionItems
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
