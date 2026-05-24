import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-darkBorder bg-darkBg/30 py-6 px-8 text-center text-xs text-textSecondary flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
      <p>© {new Date().getFullYear()} SkillForge. Built by Kairo. All rights reserved.</p>
      <div className="flex gap-6">
        <a href="#" className="hover:text-accentCyan transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-accentCyan transition-colors">Terms of Service</a>
        <a href="https://github.com/Kairo/skillforge" target="_blank" rel="noreferrer" className="hover:text-accentCyan transition-colors">GitHub Source</a>
      </div>
    </footer>
  );
};

export default Footer;
