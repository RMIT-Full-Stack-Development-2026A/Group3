import { motion, useReducedMotion } from 'motion/react';
import { X, Circle } from '@phosphor-icons/react';

// Decorative board: a completed diagonal win. Purely thematic, not a live game.
const BOARD = ['X', null, 'O', null, 'X', null, 'O', null, 'X'];

export default function AuthBrandPanel({ compact = false, tagline = 'Every grid tells a story.' }) {
  const prefersReducedMotion = useReducedMotion();

  const cellVariants = {
    hidden: { opacity: 0, scale: 0.6 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.4, delay: 0.15 + i * 0.05, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <div className={`relative flex flex-col justify-center ${compact ? 'py-10 px-6' : 'h-full px-12 py-16'} bg-surface-container-low overflow-hidden`}>
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(195,255,74,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(195,255,74,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-sm">
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-headline text-xs font-bold uppercase tracking-[0.2em] text-volt mb-3"
        >
          TicTacToang
        </motion.p>

        {!compact && (
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-headline text-4xl font-extrabold tracking-tight text-on-surface text-balance mb-4"
          >
            {tagline}
          </motion.h1>
        )}

        {!compact && (
          <div className="grid grid-cols-3 gap-3 w-56" role="presentation" aria-hidden="true">
            {BOARD.map((mark, i) => (
              <motion.div
                key={i}
                custom={i}
                initial={prefersReducedMotion ? false : 'hidden'}
                animate="visible"
                variants={cellVariants}
                className="aspect-square rounded-lg border border-outline-variant/40 bg-surface/60 flex items-center justify-center"
              >
                {mark === 'X' && <X size={28} weight="bold" className="text-volt" />}
                {mark === 'O' && <Circle size={24} weight="bold" className="text-on-surface-variant" />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
