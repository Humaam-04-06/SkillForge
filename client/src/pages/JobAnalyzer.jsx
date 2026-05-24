import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faUpload, faSlidersH, faArrowRight, faKey } from '@fortawesome/free-solid-svg-icons';
import { useSkillForgeStore } from '../store/useSkillForgeStore';
import api from '../utils/api';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

export const JobAnalyzer = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const apiKey = useSkillForgeStore((state) => state.apiKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobDescription) {
      setErrorMsg('Please specify both a Job Title and the Job Description.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/api/ai/analyze-gap', {
        jobTitle,
        jobDescription
      });

      if (response.data && response.data.skillGap) {
        // Redirect to Gap Report page, passing the generated report ID
        navigate(`/gap-report?id=${response.data.skillGap._id}`);
      } else {
        throw new Error('Failed to generate skill gap report.');
      }
    } catch (err) {
      console.error('Job analysis error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to complete job description analysis. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Job Listing Analyzer</h1>
        <p className="text-xs text-textSecondary mt-0.5">Parse job details to cross-reference matching skills</p>
      </div>

      {/* API Key Notification Alert */}
      {!apiKey && (
        <Card bodyClassName="p-4 bg-accentPurple/10 border border-accentPurple/20 text-accentPurple text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-center">
            <FontAwesomeIcon icon={faKey} className="text-base" />
            <div>
              <p className="font-bold text-textPrimary">Demo Mode Active</p>
              <p className="text-textSecondary mt-0.5">You have not entered a private Gemini API Key in Settings. You will receive a simulated gap report.</p>
            </div>
          </div>
          <Link to="/settings" className="shrink-0">
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-accentPurple border-accentPurple/30 hover:bg-accentPurple/10">
              Configure Key
            </Button>
          </Link>
        </Card>
      )}

      {/* Analysis Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs bg-dangerRed/10 border border-dangerRed/20 text-dangerRed rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Job Title */}
          <div className="space-y-1.5">
            <label htmlFor="jobTitle" className="text-xs font-bold text-textPrimary">
              Job Title <span className="text-dangerRed">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textSecondary">
                <FontAwesomeIcon icon={faBriefcase} className="text-xs" />
              </div>
              <input
                id="jobTitle"
                type="text"
                required
                disabled={loading}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer (React/Node)"
                className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:border-accentCyan transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="jobDescription" className="text-xs font-bold text-textPrimary">
              Job Description or Posting Text <span className="text-dangerRed">*</span>
            </label>
            <textarea
              id="jobDescription"
              required
              disabled={loading}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              placeholder="Paste the full job description details, required skills lists, qualification criteria, and tools specifications here..."
              className="w-full px-4 py-3 bg-darkBg border border-darkBorder rounded-lg text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:border-accentCyan transition-colors resize-y disabled:opacity-50 min-h-[150px]"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-darkBorder flex justify-end gap-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              icon={<FontAwesomeIcon icon={faUpload} />}
            >
              Analyze Skill Gaps
            </Button>
          </div>
        </form>
      </Card>

      {/* Helpful Hint Card */}
      <Card title="How to use the analyzer" bodyClassName="p-5 flex gap-4 items-start">
        <div className="w-8 h-8 rounded-lg bg-accentCyan/10 border border-accentCyan/20 text-accentCyan flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faSlidersH} className="text-xs" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-textPrimary">Maximize your match metrics</h4>
          <p className="text-xxs text-textSecondary leading-relaxed">
            Ensure you paste the requirements section of the job listing. Gemini will scan details for tools, stacks, database names, and testing frameworks to cross-reference against your scanned repository weights.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default JobAnalyzer;
