import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRoad, 
  faChevronDown, 
  faChevronUp, 
  faBook, 
  faVideo, 
  faHammer, 
  faKeyboard, 
  faCheckCircle,
  faCircle,
  faSlidersH,
  faArrowRight,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  const fetchActiveRoadmap = async () => {
    try {
      const response = await api.get('/api/roadmap/active');
      setRoadmap(response.data);
      
      // Auto-expand first week
      if (response.data && response.data.weeks && response.data.weeks.length > 0) {
        setExpandedWeeks({ 1: true });
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRoadmap();
  }, []);

  const toggleWeek = (weekNum) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  const handleTaskToggle = async (weekNumber, dayNumber, currentCompleted) => {
    try {
      const response = await api.patch('/api/roadmap/complete-task', {
        weekNumber,
        dayNumber,
        completed: !currentCompleted
      });

      if (response.data && response.data.roadmap) {
        // Update local roadmap state with recalculated stats
        setRoadmap(response.data.roadmap);
      }
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      alert('Error updating task. Please try again.');
    }
  };

  const getTaskIcon = (type) => {
    switch (String(type).toLowerCase()) {
      case 'read':
        return faBook;
      case 'watch':
        return faVideo;
      case 'build':
        return faHammer;
      case 'practice':
      default:
        return faKeyboard;
    }
  };

  const getTaskColorClass = (type) => {
    switch (String(type).toLowerCase()) {
      case 'read':
        return 'text-accentCyan bg-accentCyan/10 border-accentCyan/20';
      case 'watch':
        return 'text-accentPurple bg-accentPurple/10 border-accentPurple/20';
      case 'build':
        return 'text-successGreen bg-successGreen/10 border-successGreen/20';
      case 'practice':
      default:
        return 'text-warningAmber bg-warningAmber/10 border-warningAmber/20';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 rounded-full border-2 border-accentCyan/20 border-t-accentCyan animate-spin" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <FontAwesomeIcon icon={faRoad} className="text-4xl text-textSecondary" />
        <h2 className="text-lg font-bold text-textPrimary">No Active Roadmap</h2>
        <p className="text-xs text-textSecondary leading-relaxed">
          You don't have an active roadmap yet. Scanned technical skill gaps are required to spin up custom curriculums.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/job">
            <Button variant="primary">Analyze Job Description</Button>
          </Link>
          <Link to="/analyze">
            <Button variant="secondary">Scan Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center gap-4 flex-wrap border-b border-darkBorder pb-3">
        <div>
          <Badge variant="success">Active Roadmap</Badge>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">
            {roadmap.skillGapId?.jobTitle || 'Target Career'} Curriculum
          </h1>
          <p className="text-xxs text-textSecondary">
            Duration: {roadmap.duration} Days | Core focus: Bridge tech discrepancies
          </p>
        </div>
        <Link to="/job">
          <Button variant="secondary" size="sm" icon={<FontAwesomeIcon icon={faSlidersH} />}>
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Progress Card */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-3">
          <div>
            <h3 className="text-sm font-bold text-textPrimary">Curriculum Completion Progress</h3>
            <p className="text-xxs text-textSecondary mt-0.5">Check off completed days to increment metrics</p>
          </div>
          <span className="text-lg font-black text-accentCyan">{roadmap.progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-darkBg rounded-full overflow-hidden border border-darkBorder">
          <div 
            className="h-full bg-gradient-to-r from-accentPurple to-accentCyan rounded-full transition-all duration-1000" 
            style={{ width: `${roadmap.progress}%` }}
          />
        </div>
      </Card>

      {/* Accordion Weeks List */}
      <div className="space-y-4">
        {roadmap.weeks.map((week) => {
          const isExpanded = !!expandedWeeks[week.weekNumber];
          const completedCount = week.days.filter(d => d.completed).length;

          return (
            <div 
              key={week.weekNumber} 
              className="border border-darkBorder rounded-xl bg-darkCard/30 overflow-hidden transition-colors"
            >
              {/* Accordion Trigger Header */}
              <button
                onClick={() => toggleWeek(week.weekNumber)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-darkCard/50 transition-colors gap-4 text-left"
              >
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-textPrimary">
                    Week {week.weekNumber}: {week.goal}
                  </h3>
                  <p className="text-xxs text-textSecondary mt-0.5">
                    {completedCount} of {week.days.length} days checked off
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={completedCount === week.days.length ? 'success' : 'purple'}>
                    {completedCount === week.days.length ? 'Completed' : `${completedCount}/${week.days.length} days`}
                  </Badge>
                  <FontAwesomeIcon 
                    icon={isExpanded ? faChevronUp : faChevronDown} 
                    className="text-textSecondary text-xs" 
                  />
                </div>
              </button>

              {/* Accordion Panel Content */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-darkBorder/40 pt-4 divide-y divide-darkBorder/40">
                  {week.days.map((day) => (
                    <div 
                      key={day.day} 
                      className={`py-4 first:pt-0 last:pb-0 flex items-start gap-4 justify-between transition-opacity ${
                        day.completed ? 'opacity-65' : ''
                      }`}
                    >
                      {/* Left: Checkbox + Day indicator */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <button
                          onClick={() => handleTaskToggle(week.weekNumber, day.day, day.completed)}
                          className="mt-0.5 text-lg cursor-pointer transition-colors"
                          className={day.completed ? "text-successGreen hover:text-successGreen/75 mt-0.5 text-lg" : "text-textSecondary hover:text-accentCyan mt-0.5 text-lg"}
                        >
                          <FontAwesomeIcon icon={day.completed ? faCheckCircle : faCircle} />
                        </button>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xxs font-mono font-bold text-textSecondary uppercase">Day {day.day}</span>
                            <div className={`px-2 py-0.5 rounded-full border text-xxs font-semibold flex items-center gap-1.5 ${getTaskColorClass(day.type)}`}>
                              <FontAwesomeIcon icon={getTaskIcon(day.type)} className="text-xxs" />
                              <span className="capitalize">{day.type}</span>
                            </div>
                          </div>
                          <p className="text-xs text-textPrimary leading-relaxed font-medium">
                            {day.task}
                          </p>
                          {day.resource && (
                            <p className="text-xxs text-textSecondary">
                              📖 Resource Suggestion:{' '}
                              <span className="text-accentCyan font-medium select-all hover:underline cursor-pointer">
                                {day.resource}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Done Banner CTA */}
      <Card bodyClassName="p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-darkCard to-successGreen/5 border-successGreen/15">
        <div>
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Keep pushing your limits</h4>
          <p className="text-xxs text-textSecondary mt-0.5">Solve daily challenges to increase streak counts and sync public profile logs.</p>
        </div>
        <Link to="/challenges">
          <Button variant="success" size="sm" icon={<FontAwesomeIcon icon={faArrowRight} />}>
            Go to Challenges
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default Roadmap;
