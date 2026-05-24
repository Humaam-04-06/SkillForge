import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Card 
        className="max-w-md w-full text-center border-darkBorder" 
        bodyClassName="p-8 flex flex-col items-center gap-5"
      >
        <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl text-accentPurple animate-bounce" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-textPrimary">Page Not Found</h2>
          <p className="text-xs text-textSecondary leading-relaxed">
            The page you are looking for does not exist or has been relocated by administrators.
          </p>
        </div>
        <Link to="/">
          <Button variant="primary" icon={<FontAwesomeIcon icon={faHome} />}>
            Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
