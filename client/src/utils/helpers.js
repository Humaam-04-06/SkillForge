/**
 * Format date string into human readable format (e.g. May 24, 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format relative time (e.g. "2 days ago")
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const now = new Date();
  const past = new Date(dateString);
  const diffTime = Math.abs(now - past);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffTime / (1000 * 60));
      return diffMins <= 1 ? 'just now' : `${diffMins} minutes ago`;
    }
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return formatDate(dateString);
};

/**
 * Get color scheme based on skill gap priority
 */
export const getPriorityBadgeStyle = (priority) => {
  switch (String(priority).toLowerCase()) {
    case 'high':
    case 'critical':
      return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'medium':
    case 'moderate':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'low':
    case 'strong':
    default:
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
  }
};
