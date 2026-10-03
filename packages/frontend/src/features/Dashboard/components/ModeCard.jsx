import React from 'react';
import { Users, Robot, Globe, ArrowRight } from '@phosphor-icons/react';
import BorderGlow from '../../../shared/components/ui/border-glow/BorderGlow';

const ICONS = { group: Users, smart_toy: Robot, public: Globe };

const ModeCard = ({
  title,
  description,
  icon,
  actionLabel,
  isFeatured = false,
  spanCols = 'md:col-span-4',
  onClick,
}) => {
  const Icon = ICONS[icon] ?? Users;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 w-[82%] sm:w-[60%] snap-center md:w-auto md:shrink md:snap-none ${spanCols} group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60 rounded-[28px]`}
    >
      <BorderGlow
        className={`h-full glass-xcard bg-black/40 backdrop-blur-lg p-8 transition-all duration-500 group-hover:bg-black/60 group-hover:-translate-y-2 flex flex-col justify-between overflow-hidden !border-none ${
          isFeatured ? 'group-hover:bg-black/70' : ''
        }`}
        edgeSensitivity={30}
        glowColor="75 90 65"
        backgroundColor="#120F17"
        borderRadius={28}
        glowRadius={40}
        glowIntensity={1}
        coneSpread={25}
        animated={false}
        colors={['#c3ff4a', '#9fe62a', '#2dd4bf']}
      >
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-volt/5 rounded-full blur-3xl group-hover:bg-volt/10 transition-colors -z-10" />

        <div>
          <div className="w-12 h-12 rounded-lg bg-surface-bright flex items-center justify-center mb-6 text-volt shadow-inner">
            <Icon size={26} weight="bold" aria-hidden="true" />
          </div>
          <h3 className={`${isFeatured ? 'text-3xl' : 'text-2xl'} font-bold font-headline text-on-surface mb-2 tracking-tight`}>
            {title}
          </h3>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">{description}</p>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-volt text-volt-ink font-bold rounded-lg w-fit group-hover:gap-3 transition-all">
          {actionLabel}
          <ArrowRight size={18} weight="bold" aria-hidden="true" />
        </div>
      </BorderGlow>
    </button>
  );
};

export default ModeCard;
