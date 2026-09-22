import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TopHeader } from '../components/layout/TopHeader.jsx';
import { ClassCard } from '../components/dashboard/ClassCard.jsx';
import { DeadlinePanel } from '../components/dashboard/DeadlinePanel.jsx';
import { AssignmentList } from '../components/dashboard/AssignmentList.jsx';
import { useDashboard } from '../context/DashboardContext.jsx';
import { Calendar, Bell, Search, Sparkles } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { dashboardData } = useDashboard();

  return (
    <div className="dashboard-container">
      <TopHeader />

      <main className="dashboard-main">
        {/* Left Column (60%): Today's Classes */}
        <section className="dashboard-left">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
                Good morning, Ananya 👋
              </h1>
              <p className="text-sm text-secondary">
                Here is your live classroom schedule and auto-extracted action items.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-sm uppercase tracking-wider text-secondary flex items-center gap-2">
              <Calendar size={16} className="text-accent" /> Today's Live Schedule
            </h2>

            {dashboardData.classes.map(cls => (
              <ClassCard key={cls.id} item={cls} />
            ))}
          </div>
        </section>

        {/* Right Column (40%): Deadlines, Assignments, Announcements */}
        <section className="dashboard-right">
          {/* Pinned Deadlines */}
          <DeadlinePanel deadlines={dashboardData.deadlines} />

          {/* Assignments Checklist */}
          <AssignmentList assignments={dashboardData.assignments} />

          {/* Teacher Announcements */}
          <div className="card flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-bold text-sm uppercase tracking-wider text-secondary flex items-center gap-2">
                <Bell size={16} className="text-accent" /> Announcements
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              {dashboardData.announcements.map(an => (
                <div key={an.id} className="announcement-item flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-primary">{an.title}</span>
                    <span className="text-xs text-muted">{an.date}</span>
                  </div>
                  <p className="text-xs text-secondary">{an.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
