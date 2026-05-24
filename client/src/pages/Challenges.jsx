import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarCheck, 
  faFire, 
  faTrophy, 
  faCheckCircle, 
  faArrowRight, 
  faArrowLeft,
  faPlay,
  faEdit,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { useSkillForgeStore } from '../store/useSkillForgeStore';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { formatDate } from '../utils/helpers';

export const Challenges = () => {
  const { user, setUser } = useSkillForgeStore();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Quiz states
  const [selectedOption, setSelectedOption] = useState('');
  // Coding states
  const [codingSolution, setCodingSolution] = useState('');
  
  // History states
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchTodayChallenge = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/challenges/today');
      setChallenge(response.data);
      if (response.data && response.data.completed) {
        setCodingSolution(response.data.solution || '');
      } else {
        setCodingSolution('');
        setSelectedOption('');
      }
    } catch (err) {
      console.error('Error fetching today\'s challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await api.get(`/api/challenges/history?page=${historyPage}&limit=5`);
      setHistory(response.data.challenges || []);
      setTotalPages(response.data.pages || 1);
    } catch (err) {
      console.error('Error fetching challenge history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayChallenge();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [historyPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!challenge) return;

    const solution = challenge.challenge.type === 'quiz' ? selectedOption : codingSolution;
    if (!solution || solution.trim() === '') {
      alert('Please fill out a solution before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      // Evaluate if it's a quiz (evaluate correct client-side too for responsive response alert)
      let isCorrect = true;
      if (challenge.challenge.type === 'quiz') {
        isCorrect = (solution === challenge.challenge.correctAnswer);
      }

      const response = await api.post('/api/challenges/complete', {
        challengeId: challenge._id,
        solution: solution,
        isCorrect: isCorrect
      });

      if (response.data) {
        // Sync user streak and completed count in global store
        const updatedUser = { ...user };
        updatedUser.streak = response.data.streak;
        updatedUser.challengesCompletedCount = response.data.challengesCompletedCount;
        setUser(updatedUser);

        // Fetch refreshed challenge details
        await fetchTodayChallenge();
        // Refresh history log
        setHistoryPage(1);
        fetchHistory();

        if (isCorrect) {
          alert('🎉 Awesome! Your solution is correct! Streak updated.');
        } else {
          alert(`Incorrect answer. The correct answer was: "${challenge.challenge.correctAnswer}". Keep practicing!`);
        }
      }
    } catch (err) {
      console.error('Failed to submit challenge:', err);
      alert('Failed to submit your solution. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
      {/* Title Header with Streaks */}
      <div className="flex justify-between items-center gap-4 flex-wrap border-b border-darkBorder pb-3">
        <div>
          <Badge variant="warning">Practice Platform</Badge>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">Daily Challenges</h1>
          <p className="text-xxs text-textSecondary">Strengthen technical vocabulary and coding foundations daily</p>
        </div>
        
        {/* Streak counters */}
        <div className="flex gap-4">
          <Card bodyClassName="py-2.5 px-4 flex items-center gap-3">
            <FontAwesomeIcon icon={faFire} className={`text-xl text-warningAmber ${user?.streak > 0 ? "animate-pulse" : ""}`} />
            <div>
              <p className="text-xxs text-textSecondary uppercase font-bold">Active Streak</p>
              <p className="text-xs font-bold text-textPrimary">{user?.streak || 0} days</p>
            </div>
          </Card>
          <Card bodyClassName="py-2.5 px-4 flex items-center gap-3">
            <FontAwesomeIcon icon={faTrophy} className="text-xl text-successGreen" />
            <div>
              <p className="text-xxs text-textSecondary uppercase font-bold">Total Solved</p>
              <p className="text-xs font-bold text-textPrimary">{user?.challengesCompletedCount || 0}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Grid: Active Challenge */}
      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-accentCyan/20 border-t-accentCyan animate-spin" />
        </div>
      ) : challenge ? (
        <Card 
          title={challenge.challenge.title} 
          subtitle={`Skill: ${challenge.challenge.skill}`}
          action={
            challenge.completed ? (
              <Badge variant="success">Solved</Badge>
            ) : (
              <Badge variant="warning font-mono">Pending</Badge>
            )
          }
        >
          <div className="space-y-4">
            <div className="flex gap-2.5 flex-wrap">
              <Badge variant="purple">{challenge.challenge.type}</Badge>
              <Badge variant="secondary">{challenge.challenge.difficulty} difficulty</Badge>
              <Badge variant="info">Due today</Badge>
            </div>

            <div className="bg-darkBg/60 border border-darkBorder rounded-lg p-5 leading-relaxed text-xs text-textPrimary">
              {/* Support formatting code block in descriptions */}
              <p className="whitespace-pre-line font-medium">{challenge.challenge.description}</p>
            </div>

            {/* Answer forms */}
            {challenge.completed ? (
              <div className="p-4 rounded-lg bg-successGreen/5 border border-successGreen/25 space-y-2 text-xs">
                <p className="font-bold text-successGreen flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} /> Challenge Completed successfully!
                </p>
                <div className="mt-2">
                  <p className="text-xxs text-textSecondary font-bold uppercase">Your Submitted Solution:</p>
                  <pre className="mt-1 p-3 bg-darkBg border border-darkBorder rounded font-mono text-xxs overflow-x-auto select-all max-h-[150px]">
                    {challenge.solution}
                  </pre>
                </div>
                {challenge.challenge.type === 'quiz' && (
                  <p className="text-xxs text-textSecondary mt-2">
                    Evaluation: {challenge.isCorrect ? <strong className="text-successGreen">Correct</strong> : <strong className="text-dangerRed">Incorrect (Correct: {challenge.challenge.correctAnswer})</strong>}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Quiz format */}
                {challenge.challenge.type === 'quiz' ? (
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-textPrimary">Select the correct option:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {challenge.challenge.options.map((opt, idx) => (
                        <label 
                          key={idx}
                          className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center gap-3 transition-colors ${
                            selectedOption === opt 
                              ? 'bg-accentPurple/10 border-accentCyan text-textPrimary' 
                              : 'bg-darkCard/30 border-darkBorder text-textSecondary hover:text-textPrimary hover:bg-darkCard/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="quiz-option"
                            value={opt}
                            checked={selectedOption === opt}
                            onChange={() => setSelectedOption(opt)}
                            className="text-accentCyan focus:ring-accentCyan bg-darkBg border-darkBorder"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Code / Text description format */
                  <div className="space-y-2">
                    <label htmlFor="solution-input" className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faEdit} />
                      Write your solution/code below:
                    </label>
                    <textarea
                      id="solution-input"
                      required
                      value={codingSolution}
                      onChange={(e) => setCodingSolution(e.target.value)}
                      rows={6}
                      placeholder="Paste your source code or write your conceptual explanation details here..."
                      className="w-full font-mono text-xxs p-4 bg-darkBg border border-darkBorder rounded-lg text-textPrimary focus:outline-none focus:border-accentCyan focus:ring-1 focus:ring-accentCyan resize-y min-h-[120px]"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-darkBorder flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={submitting}
                    icon={<FontAwesomeIcon icon={faPlay} className="text-xs" />}
                  >
                    Submit Solution
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      ) : (
        <Card bodyClassName="p-8 text-center text-textSecondary text-xs">
          No daily challenge available. Create a skill profile scan or roadmap to trigger challenges.
        </Card>
      )}

      {/* Challenge history */}
      <Card title="Past Completed Challenges" subtitle="Your archive of achievements">
        {historyLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 rounded-full border border-accentCyan/20 border-t-accentCyan animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            <div className="divide-y divide-darkBorder/40">
              {history.map((hist) => (
                <div key={hist._id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-textPrimary">{hist.challenge.title}</h4>
                    <div className="flex gap-2 text-xxs text-textSecondary flex-wrap">
                      <span>Category: <strong className="text-textPrimary">{hist.challenge.skill}</strong></span>
                      <span>•</span>
                      <span>Difficulty: <strong className="text-textPrimary">{hist.challenge.difficulty}</strong></span>
                      <span>•</span>
                      <span>Solved on {formatDate(hist.completedAt)}</span>
                    </div>
                  </div>
                  <Badge variant={hist.isCorrect ? 'success' : 'danger'}>
                    {hist.isCorrect ? 'Correct' : 'Incorrect'}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-3 border-t border-darkBorder/60 flex items-center justify-between">
                <span className="text-xxs text-textSecondary">
                  Page {historyPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={historyPage === 1}
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    icon={<FontAwesomeIcon icon={faChevronLeft} />}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={historyPage === totalPages}
                    onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                    icon={<FontAwesomeIcon icon={faChevronRight} />}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-textSecondary text-xs">
            No completed challenges yet. Solve today's challenge to build your history!
          </div>
        )}
      </Card>
    </div>
  );
};

export default Challenges;
