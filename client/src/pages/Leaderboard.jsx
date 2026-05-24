import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faFire, faUser, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/api/profile/leaderboard');
        setLeaderboard(response.data || []);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setErrorMsg('Failed to load leaderboard data. Please check back later.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 text-base" title="1st Place (Gold Medal)" />;
      case 2:
        return <FontAwesomeIcon icon={faTrophy} className="text-slate-350 text-base" title="2nd Place (Silver Medal)" />;
      case 3:
        return <FontAwesomeIcon icon={faTrophy} className="text-amber-650 text-base" title="3rd Place (Bronze Medal)" />;
      default:
        return <span className="text-xs font-mono font-bold text-textSecondary">{rank}</span>;
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap border-b border-darkBorder pb-3">
        <div>
          <Badge variant="purple">Community Standings</Badge>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1">Daily Challenge Leaderboard</h1>
          <p className="text-xxs text-textSecondary">Global streak statistics for SkillForge software developers</p>
        </div>
      </div>

      {loading ? (
        <div className="h-[250px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-accentCyan/20 border-t-accentCyan animate-spin" />
        </div>
      ) : errorMsg ? (
        <Card bodyClassName="p-4 bg-red-500/10 border border-red-500/20 text-dangerRed text-xs flex gap-3 items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>{errorMsg}</p>
        </Card>
      ) : leaderboard.length > 0 ? (
        <Card bodyClassName="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-darkBorder bg-darkCard/50 text-[10px] uppercase font-bold text-textSecondary tracking-wider">
                  <th className="px-6 py-4 text-center w-16">Rank</th>
                  <th className="px-6 py-4">Developer</th>
                  <th className="px-6 py-4 text-center">Active Streak</th>
                  <th className="px-6 py-4 text-center">Challenges Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder/40">
                {leaderboard.map((item, index) => {
                  const rank = index + 1;
                  return (
                    <tr 
                      key={item._id}
                      className="hover:bg-darkCard/20 transition-colors"
                    >
                      {/* Rank badge */}
                      <td className="px-6 py-4 text-center font-bold">
                        {getRankBadge(rank)}
                      </td>

                      {/* Developer metadata */}
                      <td className="px-6 py-4">
                        <Link 
                          to={`/u/${item.username}`}
                          className="flex items-center gap-3.5 group w-fit"
                        >
                          <img
                            src={item.avatarUrl || 'https://via.placeholder.com/150'}
                            alt={item.displayName}
                            className="w-8 h-8 rounded-full border border-darkBorder group-hover:border-accentCyan/40 transition-colors"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-textPrimary group-hover:text-accentCyan transition-colors">
                              {item.displayName}
                            </h4>
                            <p className="text-[10px] text-textSecondary mt-0.5">@{item.username}</p>
                          </div>
                        </Link>
                      </td>

                      {/* Streak Days */}
                      <td className="px-6 py-4 text-center font-bold text-warningAmber text-xs">
                        <span className="inline-flex items-center gap-1.5 justify-center">
                          {item.streak || 0}{' '}
                          <FontAwesomeIcon icon={faFire} className={item.streak > 0 ? "animate-pulse text-xs" : "text-xs"} />
                        </span>
                      </td>

                      {/* Solved challenges */}
                      <td className="px-6 py-4 text-center text-xs font-semibold text-textPrimary">
                        <span className="inline-flex items-center gap-1.5 justify-center">
                          {item.challengesCompletedCount || 0}{' '}
                          <FontAwesomeIcon icon={faCheckCircle} className="text-successGreen text-xxs" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card bodyClassName="p-8 text-center text-textSecondary text-xs">
          No developers listed yet. Complete your profile setup and solve today's challenge to lead the board!
        </Card>
      )}
    </div>
  );
};

export default Leaderboard;
