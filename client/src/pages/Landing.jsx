import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCodeBranch, 
  faChartPie, 
  faRoad, 
  faCalendarCheck, 
  faComments, 
  faIdCard,
  faArrowRight,
  faUserLock,
  faUpload,
  faSlidersH
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';

export const Landing = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleGitHubLogin = () => {
    window.location.href = `${API_URL}/api/auth/github`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const features = [
    {
      title: 'GitHub Profile Analyzer',
      description: 'Fetch your public repositories, languages and commit frequencies to automatically graph your current capabilities.',
      icon: faCodeBranch,
      color: 'text-accentCyan'
    },
    {
      title: 'AI Skill Gap Report',
      description: 'Paste any job description to compare your active experience side-by-side with recruiter criteria using Gemini.',
      icon: faChartPie,
      color: 'text-accentPurple'
    },
    {
      title: 'Personalized Roadmap',
      description: 'Receive structured 30, 60, or 90 day curriculum roadmaps detailing daily topics, tutorials, and checkboxes.',
      icon: faRoad,
      color: 'text-successGreen'
    },
    {
      title: 'Daily Coding Challenges',
      description: 'Test your understanding with daily conceptual quizzes or sandbox coding questions tailored to fill your direct gaps.',
      icon: faCalendarCheck,
      color: 'text-warningAmber'
    },
    {
      title: 'Interactive AI Mentor',
      description: 'Chat with an AI career advisor injected with your repository codebase insights and study progress.',
      icon: faComments,
      color: 'text-accentCyan'
    },
    {
      title: 'Resume Bullet Optimizer',
      description: 'Convert raw repo structures and commits into recruiter-ready accomplishments following high-impact formats.',
      icon: faIdCard,
      color: 'text-accentPurple'
    }
  ];

  return (
    <div className="w-full min-h-screen py-16 px-6 md:px-12 flex flex-col items-center">
      {/* Hero Section */}
      <motion.div 
        className="max-w-4xl text-center flex flex-col items-center gap-6 mt-8 mb-20"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <span className="px-4 py-1.5 rounded-full border border-accentCyan/20 bg-accentCyan/5 text-accentCyan text-xs font-semibold tracking-wider uppercase animate-pulse">
          🚀 Powered by Gemini 2.0 Flash
        </span>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-textPrimary mt-2 leading-tight">
          Bridge the Gap Between You and Your{' '}
          <span className="bg-gradient-to-r from-accentCyan via-accentPurple to-indigo-500 bg-clip-text text-transparent">
            Dream Job
          </span>
        </h1>
        
        <p className="text-base md:text-xl text-textSecondary max-w-2xl font-light leading-relaxed">
          SkillForge scans your GitHub profile, matches it against target job listings, highlights key technical gaps, and structures a day-by-day learning path.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleGitHubLogin}
            icon={<FontAwesomeIcon icon={faGithub} className="text-lg" />}
          >
            Connect GitHub Profile
          </Button>
          <a href="#how-it-works" className="text-sm font-semibold text-accentCyan hover:text-accentCyan/80 flex items-center gap-1.5 group transition-colors py-2 px-4">
            Learn how it works 
            <FontAwesomeIcon icon={faArrowRight} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="max-w-6xl w-full mb-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-textPrimary">Everything You Need to Scale</h2>
          <p className="text-sm text-textSecondary mt-2">Custom tools designed to convert raw code repositories into developer growth.</p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feat) => (
            <motion.div key={feat.title} variants={itemVariants}>
              <Card 
                className="h-full border border-darkBorder hover:border-accentCyan/30 hover:shadow-accentCyan/5 transition-all duration-500 hover:-translate-y-1.5"
                bodyClassName="flex flex-col gap-4"
              >
                <div className={`w-12 h-12 rounded-lg bg-darkBg border border-darkBorder flex items-center justify-center text-lg ${feat.color}`}>
                  <FontAwesomeIcon icon={feat.icon} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-textPrimary mb-1">{feat.title}</h3>
                  <p className="text-sm text-textSecondary leading-relaxed">{feat.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="max-w-5xl w-full mb-20 scroll-mt-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-textPrimary">How SkillForge Works</h2>
          <p className="text-sm text-textSecondary mt-2">Three simple steps to unlock tailored AI learning tracks.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-accentCyan/20 to-accentPurple/20 -translate-y-1/2 hidden md:block z-0" />

          {/* Step 1 */}
          <Card className="text-center relative z-10 hover:border-accentCyan/20 duration-300" bodyClassName="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accentCyan/10 border border-accentCyan/20 text-accentCyan flex items-center justify-center font-bold text-lg">
              1
            </div>
            <FontAwesomeIcon icon={faGithub} className="text-3xl text-textSecondary" />
            <h3 className="text-lg font-bold text-textPrimary">Scan Profile</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Connect with GitHub OAuth. Our parser reads repo metadata and aggregates language footprints.
            </p>
          </Card>

          {/* Step 2 */}
          <Card className="text-center relative z-10 hover:border-accentPurple/20 duration-300" bodyClassName="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accentPurple/10 border border-accentPurple/20 text-accentPurple flex items-center justify-center font-bold text-lg">
              2
            </div>
            <FontAwesomeIcon icon={faUpload} className="text-3xl text-textSecondary" />
            <h3 className="text-lg font-bold text-textPrimary">Upload Job</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Paste details of any developer job listing. Gemini parses requirements and compares them against your repo logs.
            </p>
          </Card>

          {/* Step 3 */}
          <Card className="text-center relative z-10 hover:border-successGreen/20 duration-300" bodyClassName="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-successGreen/10 border border-successGreen/20 text-successGreen flex items-center justify-center font-bold text-lg">
              3
            </div>
            <FontAwesomeIcon icon={faSlidersH} className="text-3xl text-textSecondary" />
            <h3 className="text-lg font-bold text-textPrimary">Follow Study Track</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Receive a daily study guide, code daily challenges, track streaks, and download resume logs.
            </p>
          </Card>
        </div>
      </div>

      {/* Call to action */}
      <motion.div 
        className="max-w-4xl w-full text-center py-12 px-6 rounded-2xl bg-gradient-to-r from-accentPurple/10 via-accentCyan/5 to-accentPurple/10 border border-darkBorder flex flex-col items-center gap-6"
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-textPrimary">Ready to Upgrade Your Developer Career?</h2>
        <p className="text-sm text-textSecondary max-w-xl">
          Create a public profile recruiters will love, backed by real projects and daily learning streaks.
        </p>
        <Button 
          variant="primary" 
          size="md"
          onClick={handleGitHubLogin}
          icon={<FontAwesomeIcon icon={faGithub} className="text-base" />}
        >
          Get Started Now
        </Button>
      </motion.div>
    </div>
  );
};

export default Landing;
