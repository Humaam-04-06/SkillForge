import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faChartPie, 
  faGraduationCap, 
  faRoad, 
  faDownload, 
  faCheckCircle, 
  faExclamationTriangle,
  faSlidersH
} from '@fortawesome/free-solid-svg-icons';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../utils/api';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { formatDate, getPriorityBadgeStyle } from '../utils/helpers';

export const GapReport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reportId = searchParams.get('id');

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        let response;
        if (reportId) {
          response = await api.get(`/api/ai/gap-report/${reportId}`);
        } else {
          response = await api.get('/api/ai/gap-report/latest');
        }
        setReport(response.data);
      } catch (err) {
        console.error('Error fetching gap report:', err);
        setErrorMsg('Could not retrieve gap report. Try analyzing a new job description.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  const handleGenerateRoadmap = async () => {
    if (!report) return;

    setRoadmapLoading(true);
    try {
      const response = await api.post('/api/ai/generate-roadmap', {
        skillGapId: report._id,
        duration: Number(duration)
      });
      if (response.data && response.data.roadmap) {
        navigate('/roadmap');
      }
    } catch (err) {
      console.error('Error generating roadmap:', err);
      alert('Failed to generate roadmap: ' + (err.response?.data?.message || err.message));
    } finally {
      setRoadmapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 rounded-full border-2 border-accentCyan/20 border-t-accentCyan animate-spin" />
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-warningAmber" />
        <h2 className="text-lg font-bold text-textPrimary">Report Not Found</h2>
        <p className="text-xs text-textSecondary">{errorMsg || 'No skill gap analyses exist yet.'}</p>
        <Link to="/job">
          <Button variant="primary">Analyze Job Description</Button>
        </Link>
      </div>
    );
  }

  // Format Recharts data mapping (combining userSkills levels and jobRequirements levels)
  const getRadarData = () => {
    const data = [];
    const userSkillsMap = {};

    report.userSkills.forEach(s => {
      userSkillsMap[s.skill] = s.level;
    });

    report.jobRequirements.forEach(req => {
      // Map skills standard categories if direct name does not exist
      let userLevel = userSkillsMap[req.skill];
      if (userLevel === undefined) {
        // Fallback checks
        if (req.skill.toLowerCase().includes('react') || req.skill.toLowerCase().includes('css')) {
          userLevel = userSkillsMap['Frontend'] || 30;
        } else if (req.skill.toLowerCase().includes('node') || req.skill.toLowerCase().includes('express')) {
          userLevel = userSkillsMap['Backend'] || 30;
        } else if (req.skill.toLowerCase().includes('docker') || req.skill.toLowerCase().includes('aws')) {
          userLevel = userSkillsMap['DevOps'] || 20;
        } else {
          userLevel = 25; // default minimum baseline
        }
      }

      data.push({
        subject: req.skill,
        "Your Skills": userLevel,
        "Job Needs": req.level,
        fullMark: 100
      });
    });

    return data;
  };

  const radarData = getRadarData();

  // SVG Circular progress math
  const score = report.matchScore || 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // 339.29
  const strokeDashoffset = circumference - (circumference * score) / 100;

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-textSecondary">
        <Link to="/job" className="hover:text-accentCyan transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-1" /> Back to Analyzer
        </Link>
      </div>

      {/* Title */}
      <div className="flex justify-between items-center gap-4 flex-wrap border-b border-darkBorder pb-3">
        <div>
          <Badge variant="purple">Gap Report</Badge>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">{report.jobTitle}</h1>
          <p className="text-xxs text-textSecondary">Analyzed on {formatDate(report.analyzedAt)}</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => window.print()}
          icon={<FontAwesomeIcon icon={faDownload} />}
        >
          Export Report (Print)
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Match Score Gauge Card */}
        <Card bodyClassName="p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4">Overall Role Compatibility</h3>
          <div className="relative flex items-center justify-center">
            {/* SVG circle track */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle 
                cx="64" 
                cy="64" 
                r={radius} 
                stroke="rgba(30, 41, 59, 0.5)" 
                strokeWidth="8" 
                fill="transparent" 
              />
              <circle 
                cx="64" 
                cy="64" 
                r={radius} 
                stroke={score >= 70 ? "#10B981" : score >= 40 ? "#F59E0B" : "#EF4444"} 
                strokeWidth="8" 
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-textPrimary">{score}%</span>
              <span className="text-xxs text-textSecondary uppercase font-medium">Match</span>
            </div>
          </div>
          <p className="text-xxs text-textSecondary mt-4 max-w-[200px]">
            {score >= 70 
              ? "Excellent profile match! You have highly matching competencies for this role." 
              : score >= 40 
              ? "Good matching baseline. Some crucial skill gaps identified to work on."
              : "Significant gap detected. Follow the learning roadmap to bridge gaps."}
          </p>
        </Card>

        {/* Dual Radar Chart Comparison */}
        <Card 
          title="Skills Comparison Radar" 
          subtitle="Your profile metrics overlaying target requirements"
          className="md:col-span-2"
        >
          {radarData.length > 0 ? (
            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#1E293B" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} />
                  <Radar
                    name="Your Skills"
                    dataKey="Your Skills"
                    stroke="#7C3AED"
                    fill="#7C3AED"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="Required Level"
                    dataKey="Job Needs"
                    stroke="#00D1FF"
                    fill="#00D1FF"
                    fillOpacity={0.15}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                    formatter={(value) => <span className="text-textSecondary font-semibold">{value}</span>}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-textSecondary text-xs">
              No comparative categories generated.
            </div>
          )}
        </Card>
      </div>

      {/* Main Grid: Identified Gaps vs Roadmap Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Identified Gaps List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Identified Skill Gaps ({report.gaps.length})</h3>
          </div>

          {report.gaps.length > 0 ? (
            <div className="space-y-3">
              {report.gaps.map((gap, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border bg-darkCard/30 flex items-center justify-between gap-4 transition-all duration-300 hover:bg-darkCard/50 ${
                    gap.priority === 'high' 
                      ? 'border-red-500/20' 
                      : gap.priority === 'medium'
                      ? 'border-amber-500/20'
                      : 'border-darkBorder'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-xs font-bold text-textPrimary">{gap.skill}</h4>
                      <Badge 
                        variant={
                          gap.priority === 'high' 
                            ? 'danger' 
                            : gap.priority === 'medium'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {gap.priority} priority
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-xxs text-textSecondary mt-1">
                      <span>Your Level: <strong className="text-textPrimary">{gap.currentLevel}</strong></span>
                      <span>Required: <strong className="text-textPrimary">{gap.requiredLevel}</strong></span>
                      <span>Gap: <strong className="text-accentCyan">{gap.gapSize} pts</strong></span>
                    </div>
                  </div>
                  
                  {/* Indicator icons */}
                  <div>
                    {gap.priority === 'high' ? (
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-dangerRed text-sm" />
                    ) : gap.priority === 'medium' ? (
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-warningAmber text-sm" />
                    ) : (
                      <FontAwesomeIcon icon={faCheckCircle} className="text-successGreen text-sm" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card bodyClassName="p-6 text-center text-textSecondary text-xs">
              <FontAwesomeIcon icon={faCheckCircle} className="text-successGreen text-2xl mb-2" />
              <p>Excellent! You have fully satisfied all required technical categories for this job.</p>
            </Card>
          )}
        </div>

        {/* Roadmap Generator Panel */}
        <Card 
          title="Bridging the Gaps" 
          subtitle="Generate a tailored learning roadmap to resolve identified discrepancies"
        >
          <div className="space-y-4">
            <div className="w-8 h-8 rounded-lg bg-accentCyan/10 border border-accentCyan/20 text-accentCyan flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faGraduationCap} className="text-xs" />
            </div>

            <p className="text-xxs text-textSecondary leading-relaxed">
              Gemini will map week-by-week checkpoints and day-by-day practice assignments (reads, video watches, sandbox drills) targeting your highest priority gaps.
            </p>

            <div className="space-y-1.5 pt-2">
              <label htmlFor="duration" className="text-xxs font-bold text-textPrimary uppercase">Roadmap Duration</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg text-xs text-textPrimary focus:outline-none focus:border-accentCyan transition-colors"
              >
                <option value={30}>30 Days (Fast Track)</option>
                <option value={60}>60 Days (Standard Pace)</option>
                <option value={90}>90 Days (Deep Curriculum)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-darkBorder">
              <Button
                variant="primary"
                onClick={handleGenerateRoadmap}
                isLoading={roadmapLoading}
                className="w-full justify-between"
                icon={<FontAwesomeIcon icon={faRoad} />}
              >
                Generate Study Roadmap
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GapReport;
