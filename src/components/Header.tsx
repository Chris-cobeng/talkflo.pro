import { Settings, CreditCard } from 'lucide-react';
import { UserButton, Protect } from '@clerk/clerk-react';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header = ({ onSettingsClick }: HeaderProps) => {
  return (
    <header className="bg-slate-700 border-b border-slate-600/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1 flex items-center justify-between">
        <div className="flex items-center">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-7 h-7 sm:w-9 sm:h-9 ring-2 ring-orange-200 ring-offset-2 ring-offset-transparent transition-all duration-300 hover:ring-orange-300"
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Protect
            plan="talkflo_pro"
            fallback={
              <a
                href="/billing"
                className="bg-white/80 text-gray-800 font-serif text-base px-4 py-1 rounded-2xl shadow min-w-[36px] min-h-[36px] flex items-center justify-center transition hover:bg-white hover:shadow-md border border-gray-200"
                aria-label="Billing"
              >
                Talkflo Prime
              </a>
            }
          >
            {/* Pro users see nothing here */}
          </Protect>
          
          <button
            onClick={onSettingsClick}
            className="p-2 sm:p-2.5 rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-200 hover:text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
