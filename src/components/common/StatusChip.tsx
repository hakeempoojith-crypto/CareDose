import React from 'react';
import { Clock, Bell, Check, X, HelpCircle, Ban } from 'lucide-react';
import { EffectiveStatus } from '../../types';
import { useStore } from '../../context/StoreContext';

interface StatusChipProps {
  status: EffectiveStatus;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  const { t } = useStore();

  let label = '';
  let Icon = Clock;
  let bgClass = 'bg-[#F0F3ED]';
  let textClass = 'text-[#53645A]';
  let borderClass = 'border-[#D5DCD5]';

  switch (status) {
    case 'Upcoming':
      label = t.statusUpcoming;
      Icon = Clock;
      bgClass = 'bg-[#F0F3ED]';
      textClass = 'text-[#53645A]';
      borderClass = 'border-[#D5DCD5]';
      break;

    case 'Due':
      label = t.statusDue;
      Icon = Bell;
      bgClass = 'bg-[#FBF2D9]';
      textClass = 'text-[#805A13]';
      borderClass = 'border-[#E6D4A5]';
      break;

    case 'Taken':
      label = t.statusTaken;
      Icon = Check;
      bgClass = 'bg-[#EAF3ED]';
      textClass = 'text-[#266044]';
      borderClass = 'border-[#B8D7C2]';
      break;

    case 'Missed':
      label = t.statusMissed;
      Icon = X;
      bgClass = 'bg-[#FBECEA]';
      textClass = 'text-[#A3342A]';
      borderClass = 'border-[#F2BDB9]';
      break;

    case 'Unconfirmed':
      label = t.statusUnconfirmed;
      Icon = HelpCircle;
      bgClass = 'bg-[#FBF2D9]';
      textClass = 'text-[#805A13]';
      borderClass = 'border-[#E6D4A5]';
      break;

    case 'Cancelled':
      label = t.statusCancelled;
      Icon = Ban;
      bgClass = 'bg-[#F0F3ED]';
      textClass = 'text-[#718278]';
      borderClass = 'border-[#D5DCD5]';
      break;
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bgClass} ${textClass} ${borderClass} ${paddingClass} tabular-nums`}
      role="status"
    >
      <Icon className={iconSize} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
