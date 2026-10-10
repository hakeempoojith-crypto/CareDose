import React from 'react';
import { getMedicineDisplay } from '../../utils/transliteration';
import { useStore } from '../../context/StoreContext';

interface MedicineTitleProps {
  name: string;
  transliterations?: { te?: string; hi?: string };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const MedicineTitle: React.FC<MedicineTitleProps> = ({
  name,
  transliterations,
  size = 'md',
  className = '',
}) => {
  const { language } = useStore();
  const { primary, secondary } = getMedicineDisplay(name, transliterations, language);

  let titleStyle = 'text-base font-serif font-bold text-[#1F2B25]';
  if (size === 'xl') titleStyle = 'text-2xl font-serif font-bold text-[#1F2B25]';
  else if (size === 'lg') titleStyle = 'text-xl font-serif font-bold text-[#1F2B25]';
  else if (size === 'sm') titleStyle = 'text-sm font-serif font-semibold text-[#1F2B25]';

  return (
    <div className={`space-y-0.5 ${className}`}>
      <div className={titleStyle}>{primary}</div>
      {secondary && (
        <div className="text-xs font-normal text-[#53645A] tracking-normal">
          {secondary}
        </div>
      )}
    </div>
  );
};
