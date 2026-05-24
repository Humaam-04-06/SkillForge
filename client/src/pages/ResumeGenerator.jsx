import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faIdCard, 
  faBook, 
  faCheckSquare, 
  faSquare, 
  faCopy, 
  faCheckCircle, 
  faDownload, 
  faExclamationTriangle,
  faMagic,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { useSkillForgeStore } from '../store/useSkillForgeStore';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { formatDate } from '../utils/helpers';

export const ResumeGenerator = () => {
  const { user } = useSkillForgeStore();
  const [repos, setRepos] = useState([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState([]);
  const [reposLoading, setReposLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedBullets, setGeneratedBullets] = useState([]);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        if (user?.githubAccessToken) {
          const response = await api.get(`https://api.github.com/users/${user.username}/repos?per_page=30&sort=updated`);
          setRepos(response.data);
        } else {
          setRepos(getMockRepos(user?.username));
        }
      } catch (err) {
        console.error('Error fetching repositories for resume generator:', err);
        setRepos(getMockRepos(user?.username));
      } finally {
        setReposLoading(false);
      }
    };
    fetchRepos();
  }, [user]);

  const toggleRepoSelection = (id) => {
    const stringId = String(id);
    setSelectedRepoIds(prev => 
      prev.includes(stringId) 
        ? prev.filter(rId => rId !== stringId) 
        : [...prev, stringId]
    );
  };

  const handleGenerateBullets = async () => {
    if (selectedRepoIds.length === 0) {
      alert('Please select at least one repository to analyze.');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/api/resume/generate', {
        repoIds: selectedRepoIds
      });

      if (response.data && response.data.projects) {
        setGeneratedBullets(response.data.projects);
      }
    } catch (err) {
      console.error('Failed to generate bullets:', err);
      alert('Failed to generate bullets: ' + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const handleDownloadTxt = async () => {
    if (generatedBullets.length === 0) return;

    try {
      const response = await api.post('/api/resume/export-pdf', {
        bullets: generatedBullets.map(p => ({
          repoName: p.repoName,
          bullets: p.bullets
        }))
      }, {
        responseType: 'blob' // Essential for file downloads
      });

      // Construct browser anchor triggers for download
      const blob = new Blob([response.data], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'skillforge_resume_bullets.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download txt file:', err);
      alert('Export failed.');
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap border-b border-darkBorder pb-3">
        <div>
          <Badge variant="purple">Career Accelerator</Badge>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">Resume AI Generator</h1>
          <p className="text-xxs text-textSecondary">Convert codebase metrics and features into action-oriented resume accomplishments</p>
        </div>
        {generatedBullets.length > 0 && (
          <Button 
            variant="success" 
            size="sm"
            onClick={handleDownloadTxt}
            icon={<FontAwesomeIcon icon={faDownload} />}
          >
            Export All (.txt)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Repos list checkbox selector */}
        <Card 
          title="Repository Selector" 
          subtitle="Choose projects to highlight (Max 3 recommended)"
          className="lg:col-span-2 h-fit"
        >
          {reposLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 rounded-full border border-accentCyan/20 border-t-accentCyan animate-spin" />
            </div>
          ) : repos.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                {repos.map((repo) => {
                  const isChecked = selectedRepoIds.includes(String(repo.id));
                  return (
                    <button
                      key={repo.id}
                      onClick={() => toggleRepoSelection(repo.id)}
                      className={`w-full p-3 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                        isChecked 
                          ? 'bg-accentPurple/10 border-accentPurple/30 text-textPrimary' 
                          : 'bg-darkCard/30 border-darkBorder text-textSecondary hover:text-textPrimary hover:bg-darkCard/50'
                      }`}
                    >
                      <FontAwesomeIcon 
                        icon={isChecked ? faCheckSquare : faSquare} 
                        className={`text-sm mt-0.5 shrink-0 ${isChecked ? 'text-accentCyan' : 'text-textSecondary/40'}`} 
                      />
                      <div className="min-w-0">
                        <h4 className="text-xxs font-bold text-textPrimary truncate">{repo.name}</h4>
                        <p className="text-[10px] text-textSecondary truncate mt-0.5">{repo.language || 'Plain Text'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-darkBorder flex">
                <Button
                  variant="primary"
                  onClick={handleGenerateBullets}
                  disabled={selectedRepoIds.length === 0}
                  isLoading={generating}
                  className="w-full"
                  icon={<FontAwesomeIcon icon={faMagic} />}
                >
                  Generate Resume Bullets
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-textSecondary text-xs">
              No repositories found.
            </div>
          )}
        </Card>

        {/* Right: Generated bullet results */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">AI Generated Accomplishments</h3>
          
          {generating ? (
            <Card bodyClassName="py-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-10 h-10 rounded-xl border-4 border-accentCyan/30 border-t-accentCyan animate-spin" />
              <div>
                <p className="text-xs font-bold text-textPrimary">Scanning Codebase Files</p>
                <p className="text-xxs text-textSecondary mt-0.5">Gemini is structuring bullet points following the STAR methodology...</p>
              </div>
            </Card>
          ) : generatedBullets.length > 0 ? (
            <div className="space-y-4">
              {generatedBullets.map((proj, pIdx) => (
                <Card 
                  key={proj.repoId}
                  title={`Project: ${proj.repoName}`}
                  subtitle="Action Verb + Technology + Measurable Outcome"
                >
                  <div className="space-y-3.5">
                    {proj.bullets.map((bullet, bIdx) => {
                      const absoluteIdx = `${pIdx}_${bIdx}`;
                      const isCopied = copiedBulletIdx === absoluteIdx;
                      return (
                        <div 
                          key={bIdx}
                          className="p-3.5 rounded-lg border border-darkBorder bg-darkCard/25 flex items-start gap-4 justify-between group hover:border-accentCyan/20 duration-300"
                        >
                          <p className="text-xs text-textPrimary leading-relaxed select-text font-medium">
                            {bullet}
                          </p>
                          <button
                            onClick={() => handleCopyToClipboard(bullet, absoluteIdx)}
                            className={`p-1.5 rounded border text-xxs transition-all shrink-0 active:scale-95 ${
                              isCopied 
                                ? 'bg-successGreen/10 border-successGreen/20 text-successGreen' 
                                : 'bg-darkCard border-darkBorder text-textSecondary hover:text-textPrimary hover:bg-slate-800'
                            }`}
                            title="Copy to Clipboard"
                          >
                            <FontAwesomeIcon icon={isCopied ? faCheckCircle : faCopy} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card bodyClassName="py-12 text-center text-textSecondary text-xs">
              <FontAwesomeIcon icon={faIdCard} className="text-3xl text-textSecondary/50 mb-3" />
              <p className="max-w-[280px] mx-auto leading-relaxed">
                Select one or more public repositories from the sidebar selector and trigger the generator to build resume achievements.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Fallback Mock repositories generator
const getMockRepos = (username = 'Developer') => {
  return [
    { id: '101', name: 'todo-react-app', language: 'JavaScript' },
    { id: '102', name: 'node-rest-api', language: 'JavaScript' },
    { id: '103', name: 'machine-learning-sandbox', language: 'Python' },
    { id: '104', name: 'hugo-static-blog', language: 'HTML' },
    { id: '105', name: 'nginx-docker-proxy', language: 'Shell' },
  ];
};

export default ResumeGenerator;
