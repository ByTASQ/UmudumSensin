import React from 'react';
import { MatchResult, UserCriteria } from '../types/job';
import { JobDetailPane } from './JobDetailPane';

interface JobDetailModalProps {
  result: MatchResult | null;
  criteria: UserCriteria;
  isSaved?: boolean;
  onClose: () => void;
  onToggleSave?: (jobId: string) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  result,
  criteria,
  isSaved = false,
  onClose,
  onToggleSave
}) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl h-[92vh] max-h-[850px] rounded-3xl overflow-hidden border border-purple-200/60 dark:border-purple-900/40 shadow-2xl relative flex flex-col">
        <JobDetailPane
          result={result}
          criteria={criteria}
          isSaved={isSaved}
          onClose={onClose}
          onToggleSave={onToggleSave}
        />
      </div>
    </div>
  );
};
