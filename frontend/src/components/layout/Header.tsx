/**
 * Header Component
 * @description Application header with branding and clock
 */

import { memo } from 'react';
import { useClock } from '../../hooks';
import { APP_CONFIG } from '../../constants';
import { LibraryIcon } from '../icons';

export const Header = memo(() => {
  const { time, date } = useClock();

  return (
    <header className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg">
              <LibraryIcon className="w-6 h-6 text-[#1e3a5f]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {APP_CONFIG.name}
              </h1>
              <p className="text-sm text-blue-200/80">
                {APP_CONFIG.organization}
              </p>
            </div>
          </div>

          {/* Clock */}
          <div className="text-right">
            <p className="text-2xl font-mono font-bold tracking-wider">
              {time}
            </p>
            <p className="text-sm text-blue-200/80 capitalize">
              {date}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

