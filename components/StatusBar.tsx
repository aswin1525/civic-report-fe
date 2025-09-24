import React from 'react';
import { IssueStatus } from '../types';

interface StatusBarProps {
  status: IssueStatus;
}

const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  const statusConfig = {
    [IssueStatus.Pending]: {
      label: 'Pending',
      color: 'bg-pending',
      width: 'w-1/3',
      textColor: 'text-pending'
    },
    [IssueStatus.InProgress]: {
      label: 'In Progress',
      color: 'bg-inprogress',
      width: 'w-2/3',
      textColor: 'text-inprogress'
    },
    [IssueStatus.Resolved]: {
      label: 'Resolved',
      color: 'bg-resolved',
      width: 'w-full',
      textColor: 'text-resolved'
    },
  };

  const { label, color, width, textColor } = statusConfig[status];

  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-dark-400 mb-1">
        <span>Pending</span>
        <span>In Progress</span>
        <span>Resolved</span>
      </div>
      <div className="w-full bg-dark-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color} ${width}`}
        ></div>
      </div>
       <p className={`text-right text-sm font-semibold mt-2 ${textColor}`}>
        Status: {label}
      </p>
    </div>
  );
};

export default StatusBar;