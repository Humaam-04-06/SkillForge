import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faFire, 
  faChartBar, 
  faCheckCircle,
  faCodeBranch,
  faBriefcase,
  faRoad,
  faComments,
  faClock,
  faFlame
} from '@fortawesome/free-solid-svg-icons';
import { useSkillForgeStore } from '../store/useSkillForgeStore';
import api from '../utils/api';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const Dashboard = () => {
  const { user, setUser } = useSkillForgeStore();
  const navigate = useNavigate();
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Refresh User info
        const userRes = await api.get('/api/auth/me');
        if (userRes.data && userRes.data.user) {
          setUser(userRes.data.user);
        }

        // Fetch active roadmap
        try {
          const roadmapRes = await api.get('/api/roadmap/active');
          setActiveRoadmap(roadmapRes.data);
        } catch (e) {
          // No active roadmap is fine
        }

        // Fetch today's challenge
        try {
          const challengeRes = await api.get('/api/challenges/today');
          setTodayChallenge(challengeRes.data);
        } catch (e) {
          // No challenge generated yet is fine
        }

      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [setUser]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 rounded-full border-2 border-accentCyan/20 border-t-accentCyan animate-spin" />
      </div>
    );
  }

  // Calculate metrics
  const latestMatchObj = user?.matchScoreHistory && user.matchScoreHistory.length > 0
    ? user.matchScoreHistory[user.matchScoreHistory.length - 1]
    : null;

  const matchScore = latestMatchObj ? latestMatchObj.score : 0;
  const roadmapProgress = activeRoadmap ? activeRoadmap.progress : 0;
  const streakDays = user?.streak || 0;
  const challengesCount = user?.challengesCompletedCount || 0;

  const quickActions = [
    { name: 'Scan GitHub', path: '/analyze', description: 'Refresh repository profiles and skill levels', icon: faCodeBranch, color: 'text-accentCyan bg-accentCyan/10 border-accentCyan/20' },
    { name: 'Analyze Job description', path: '/job', description: 'Paste target JD details and run gap reports', icon: faBriefcase, color: 'text-accentPurple bg-accentPurple/10 border-accentPurple/20' },
    { name: 'Study Roadmap', path: '/roadmap', description: 'Work through active daily lessons', icon: faRoad, color: 'text-successGreen bg-successGreen/10 border-successGreen/20' },
    { name: 'AI Mentor Chat', path: '/mentor', description: 'Consult AI advisors for coding help', icon: faComments, color: 'text-warningAmber bg-warningAmber/10 border-warningAmber/20' }
  ];

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6">
      {/* Welcome Header Banner */}
      <Card 
        className="overflow-hidden relative border-none bg-gradient-to-r from-accentPurple/20 via-accentCyan/10 to-darkCard"
        bodyClassName="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between"
      >
        <div className="flex items-center gap-5 flex-col md:flex-row text-center md:text-left">
          <img
            src={user?.avatarUrl || 'https://via.placeholder.com/150'}
            alt={user?.displayName || 'User Avatar'}
            className="w-20 h-20 rounded-xl border border-accentCyan/30 p-1"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Welcome Back, {user?.displayName || user?.username}!
            </h1>
            <p className="text-xs md:text-sm text-textSecondary max-w-xl mt-1 leading-relaxed">
              {user?.bio || 'Analyze your repositories or paste a job description to initiate custom study tracks.'}
            </p>
            {user?.location && (
              <p className="text-xxs text-textSecondary mt-2">
                📍 {user.location} {user.company ? `| 🏢 ${user.company}` : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/u/${user?.username}`}>
            <Button variant="secondary" size="sm">
              View Public Profile
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </Link>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Match Score */}
        <Card bodyClassName="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xxs font-bold text-textSecondary uppercase tracking-wider">Latest Match Score</p>
            <h3 className="text-2xl font-black text-accentCyan">
              {matchScore ? `${matchScore}%` : 'N/A'}
            </h3>
            <p className="text-xxs text-textSecondary truncate max-w-[120px]">
              {latestMatchObj ? latestMatchObj.jobTitle : 'No job analyzed yet'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accentCyan/10 border border-accentCyan/20 text-accentCyan flex items-center justify-center">
            <FontAwesomeIcon icon={faChartBar} />
          </div>
        </Card>

        {/* Roadmap Progress */}
        <Card bodyClassName="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xxs font-bold text-textSecondary uppercase tracking-wider">Roadmap Progress</p>
            <h3 className="text-2xl font-black text-accentPurple">{roadmapProgress}%</h3>
            <div className="w-24 h-1.5 bg-darkBg rounded-full overflow-hidden mt-1 border border-darkBorder">
              <div 
                className="h-full bg-accentPurple rounded-full transition-all duration-500" 
                style={{ width: `${roadmapProgress}%` }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accentPurple/10 border border-accentPurple/20 text-accentPurple flex items-center justify-center">
            <FontAwesomeIcon icon={faRoad} />
          </div>
        </Card>

        {/* Streak Tracker */}
        <Card bodyClassName="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xxs font-bold text-textSecondary uppercase tracking-wider">Challenge Streak</p>
            <h3 className="text-2xl font-black text-warningAmber flex items-center gap-1.5">
              {streakDays} <FontAwesomeIcon icon={faFlame} className={streakDays > 0 ? "animate-pulse" : ""} />
            </h3>
            <p className="text-xxs text-textSecondary">consecutive days</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-warningAmber/10 border border-warningAmber/20 text-warningAmber flex items-center justify-center">
            <FontAwesomeIcon icon={faFire} />
          </div>
        </Card>

        {/* Challenges Completed */}
        <Card bodyClassName="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xxs font-bold text-textSecondary uppercase tracking-wider">Challenges Solved</p>
            <h3 className="text-2xl font-black text-successGreen">{challengesCount}</h3>
            <p className="text-xxs text-textSecondary">total completions</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-successGreen/10 border border-successGreen/20 text-successGreen flex items-center justify-center">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        </Card>
      </div>

      {/* Main Grid: Challenge & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Challenge Card */}
        <Card 
          title="Daily Challenge" 
          subtitle="Refine your skills with a fast conceptual or coding task"
          className="lg:col-span-2"
          action={
            todayChallenge?.completed ? (
              <Badge variant="success">Solved</Badge>
            ) : (
              <Badge variant="warning">Pending</Badge>
            )
          }
        >
          {todayChallenge ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-textPrimary">{todayChallenge.challenge.title}</h4>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <Badge variant="purple">{todayChallenge.challenge.skill}</Badge>
                  <Badge variant="secondary">{todayChallenge.challenge.difficulty} difficulty</Badge>
                  <Badge variant="info">{todayChallenge.challenge.type}</Badge>
                </div>
              </div>
              <p className="text-xs text-textSecondary leading-relaxed line-clamp-3">
                {todayChallenge.challenge.description}
              </p>
              <div className="pt-2 border-t border-darkBorder flex justify-between items-center">
                <span className="text-xxs text-textSecondary flex items-center gap-1">
                  <FontAwesomeIcon icon={faClock} /> Resets at midnight
                </span>
                <Link to="/challenges">
                  <Button variant={todayChallenge.completed ? "secondary" : "primary"} size="sm">
                    {todayChallenge.completed ? 'Review Challenge' : 'Solve Challenge'}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-textSecondary">
              <p className="text-sm">No challenge active. Analyze your profile to generate skills.</p>
              <Link to="/analyze" className="mt-3 inline-block">
                <Button variant="outline" size="sm">Scan Profile</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Quick Actions Panel */}
        <Card title="Quick Tasks" subtitle="Shortcuts to key features">
          <div className="space-y-3">
            {quickActions.map(act => (
              <Link 
                key={act.name} 
                to={act.path}
                className="flex items-center gap-4 p-3 rounded-lg border border-darkBorder hover:border-accentCyan/30 hover:bg-darkCard transition-all duration-300 group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                  <FontAwesomeIcon icon={act.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-textPrimary group-hover:text-accentCyan transition-colors truncate">{act.name}</h4>
                  <p className="text-xxs text-textSecondary truncate mt-0.5">{act.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Active Roadmap Timeline Panel */}
      {activeRoadmap && (
        <Card 
          title="Current Study Goal" 
          subtitle={`Duration: ${activeRoadmap.duration} days | Target: ${activeRoadmap.skillGapId?.jobTitle || 'Custom'}`}
          action={
            <Link to="/roadmap">
              <Button variant="ghost" size="sm" className="text-accentCyan">View Full Roadmap</Button>
            </Link>
          }
        >
          <div className="space-y-4">
            {/* Week Progression */}
            {activeRoadmap.weeks.slice(0, 2).map((week) => {
              // Find days completed in this week
              const completedCount = week.days.filter(d => d.completed).length;
              const progressPct = Math.round((completedCount / week.days.length) * 100);

              return (
                <div key={week.weekNumber} className="border-b border-darkBorder pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-textPrimary">Week {week.weekNumber}: {week.goal}</h4>
                      <p className="text-xxs text-textSecondary mt-0.5">Progress: {completedCount}/{week.days.length} days complete</p>
                    </div>
                    <Badge variant="purple">{progressPct}% complete</Badge>
                  </div>
                  <div className="w-full h-1 bg-darkBg rounded-full overflow-hidden border border-darkBorder">
                    <div 
                      className="h-full bg-accentPurple rounded-full" 
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
