import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faFire, 
  faTrophy, 
  faLink, 
  faCheckCircle, 
  faLock,
  faSlidersH
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import api from '../utils/api';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';

export const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const response = await api.get(`/api/profile/${username}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching public profile:', err);
        setErrorMsg(err.response?.data?.message || 'Failed to retrieve profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPublicProfile();
    }
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const getRadarData = () => {
    if (!profile || !profile.skills) return [];
    
    const skills = profile.skills;
    const data = [];
    
    Object.keys(skills).forEach(key => {
      data.push({ subject: key, A: skills[key], fullMark: 100 });
    });
    
    return data;
  };

  const radarData = getRadarData();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center text-textPrimary flex-col gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-accentCyan/20 border-t-accentCyan animate-spin" />
        <p className="text-xxs text-textSecondary uppercase tracking-wider font-semibold">Retrieving Public Profile...</p>
      </div>
    );
  }

  // Handle Private Profile restriction state
  if (errorMsg.includes('private')) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-dangerRed flex items-center justify-center text-xl">
          <FontAwesomeIcon icon={faLock} />
        </div>
        <h2 className="text-lg font-bold text-textPrimary">Profile is Private</h2>
        <p className="text-xs text-textSecondary leading-relaxed">
          The owner of this account (@{username}) has disabled public recruiter access. If you are the owner, toggle public settings in the settings panel.
        </p>
        <Link to="/settings">
          <Button variant="outline" size="sm">Go to Settings</Button>
        </Link>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-warningAmber flex items-center justify-center text-xl">
          <FontAwesomeIcon icon={faLock} />
        </div>
        <h2 className="text-lg font-bold text-textPrimary">Profile Not Found</h2>
        <p className="text-xs text-textSecondary leading-relaxed">
          Could not find a SkillForge developer matching the username details: "@{username}". Ensure the url username matches exactly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl w-full mx-auto py-12 px-6 space-y-6">
      
      {/* Recruiter Badge and Link Share */}
      <div className="flex justify-between items-center gap-4 flex-wrap pb-2 border-b border-darkBorder">
        <div className="flex items-center gap-2">
          <Badge variant="success">Verified Portfolio</Badge>
          <span className="text-[10px] text-textSecondary uppercase tracking-widest font-mono">SkillForge Verified</span>
        </div>
        <Button 
          variant={copiedLink ? "success" : "outline"} 
          size="sm"
          onClick={handleCopyLink}
          icon={<FontAwesomeIcon icon={copiedLink ? faCheckCircle : faLink} />}
        >
          {copiedLink ? 'Copied Link!' : 'Copy Shareable Link'}
        </Button>
      </div>

      {/* Profile Header */}
      <Card bodyClassName="p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-center justify-between text-center sm:text-left bg-gradient-to-tr from-darkCard to-accentCyan/5">
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <img
            src={profile.avatarUrl || 'https://via.placeholder.com/150'}
            alt={profile.displayName}
            className="w-20 h-20 rounded-xl border border-accentCyan/20 p-1"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{profile.displayName}</h1>
            <p className="text-xs text-accentCyan font-mono mt-0.5">@{profile.username}</p>
            <p className="text-xs text-textSecondary mt-2 max-w-xl leading-relaxed">
              {profile.bio || 'Developer focusing on building high-performance systems and refining codebase competencies daily.'}
            </p>
            {profile.location && (
              <p className="text-xxs text-textSecondary mt-2">
                📍 {profile.location} {profile.company ? `| 🏢 ${profile.company}` : ''}
              </p>
            )}
          </div>
        </div>
        
        {/* GitHub redirect */}
        <div className="shrink-0">
          <a href={`https://github.com/${profile.username}`} target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm" icon={<FontAwesomeIcon icon={faGithub} />}>
              GitHub Profile
            </Button>
          </a>
        </div>
      </Card>

      {/* Grid: Streaks & Radar charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Micro statistics */}
        <div className="space-y-4 flex flex-col justify-between">
          <Card bodyClassName="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xxs font-bold text-textSecondary uppercase tracking-wider">Active Practice Streak</p>
              <h3 className="text-2xl font-black text-warningAmber flex items-center gap-1.5">
                {profile.streak} <FontAwesomeIcon icon={faFire} className={profile.streak > 0 ? "animate-pulse" : ""} />
              </h3>
              <p className="text-xxs text-textSecondary">consecutive days solved</p>
            </div>
          </Card>

          <Card bodyClassName="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xxs font-bold text-textSecondary uppercase tracking-wider">Challenges Solved</p>
              <h3 className="text-2xl font-black text-successGreen">{profile.challengesCompletedCount}</h3>
              <p className="text-xxs text-textSecondary">total conceptual milestones</p>
            </div>
          </Card>

          {/* Active study path progress */}
          <Card 
            title="Learning Curriculum" 
            subtitle={profile.activeRoadmap ? "Currently resolving gaps" : "No roadmap configured"}
            bodyClassName="p-5"
          >
            {profile.activeRoadmap ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xxs">
                  <span className="text-textSecondary">Curriculum progress:</span>
                  <span className="font-bold text-accentCyan">{profile.activeRoadmap.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-darkBg rounded-full overflow-hidden border border-darkBorder">
                  <div 
                    className="h-full bg-accentPurple rounded-full" 
                    style={{ width: `${profile.activeRoadmap.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xxs text-textSecondary">Developer completes custom skills check ins via personal dashboards.</p>
            )}
          </Card>
        </div>

        {/* Radar Charts */}
        <Card 
          title="Skills Radar Profile" 
          subtitle="Analyzed competencies across key developer scopes"
          className="md:col-span-2"
        >
          {radarData.length > 0 ? (
            <div className="h-[220px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#1E293B" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#00D1FF"
                    fill="#00D1FF"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-textSecondary text-xs">
              No categories mapped yet.
            </div>
          )}
        </Card>
      </div>

      {/* Match history summary */}
      {profile.matchScoreHistory && profile.matchScoreHistory.length > 0 && (
        <Card title="Recruiter Compatibility Log" subtitle="Target job matches logged by the developer">
          <div className="divide-y divide-darkBorder/40">
            {profile.matchScoreHistory.map((history, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center gap-4 first:pt-0 last:pb-0">
                <span className="text-xs font-bold text-textPrimary truncate">{history.jobTitle}</span>
                <Badge variant={history.score >= 70 ? "success" : history.score >= 40 ? "warning" : "danger"}>
                  {history.score}% compatible
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PublicProfile;
