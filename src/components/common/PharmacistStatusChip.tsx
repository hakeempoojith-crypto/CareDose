import React from 'react';
import { PharmacistVerification } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatKolkataDate } from '../../utils/timezone';
import { HelpCircle, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

interface PharmacistStatusChipProps {
  verification?: PharmacistVerification;
  size?: 'sm' | 'md';
  showDetails?: boolean;
}

export const PharmacistStatusChip: React.FC<PharmacistStatusChipProps> = ({
  verification,
  size = 'md',
  showDetails = true,
}) => {
  const { t } = useStore();

  const status = verification?.status || 'UNVERIFIED';

  if (status === 'VERIFIED') {
    const dateFormatted = verification?.verifiedAt
      ? formatKolkataDate(verification.verifiedAt)
      : '';
    const pharmacistName = verification?.pharmacistName || 'Meera';

    return (
      <div className="inline-flex flex-col gap-1 items-start">
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-[#EAF3ED] text-[#266044] border-[#B8D7C2] ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm'
          }`}
          role="status"
          aria-label={`${t.statusVerifiedBy} ${pharmacistName} ${dateFormatted}`}
        >
          <CheckCircle2 className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0 text-[#266044]`} aria-hidden="true" />
          <span>
            {t.statusVerifiedBy} {pharmacistName} on {dateFormatted}
          </span>
        </span>
        {showDetails && verification?.note && (
          <span className="text-[11px] text-[#53645A] italic pl-2 border-l-2 border-[#B8D7C2]">
            Note: &ldquo;{verification.note}&rdquo;
          </span>
        )}
      </div>
    );
  }

  if (status === 'QUERY') {
    return (
      <div className="inline-flex flex-col gap-1 items-start">
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-[#FBF2D9] text-[#805A13] border-[#E6D4A5] ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm'
          }`}
          role="status"
          aria-label={`${t.statusQuery} ${verification?.note || ''}`}
        >
          <AlertCircle className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0 text-[#875E16]`} aria-hidden="true" />
          <span>
            {t.statusQuery} {verification?.note || 'Clinical clarification requested'}
          </span>
        </span>
      </div>
    );
  }

  // UNVERIFIED
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-[#F0F3ED] text-[#53645A] border-[#D5DCD5] ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm'
      }`}
      role="status"
      aria-label={t.statusUnverified}
    >
      <HelpCircle className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0 text-[#718278]`} aria-hidden="true" />
      <span>{t.statusUnverified}</span>
    </span>
  );
};
