import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Sliders,
  FlaskConical,
  Target,
  Repeat,
  TrendingUp,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transact', icon: ArrowLeftRight },
    { id: 'budget', label: 'Budget', icon: Sliders },
    { id: 'whatif', label: 'What-If', icon: FlaskConical },
    { id: 'savings', label: 'Goals', icon: Target },
    { id: 'subscriptions', label: 'Subs', icon: Repeat },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0B0D0C]/95 backdrop-blur-md border-t border-[#222925] px-2 py-1.5 z-40 flex items-center justify-around gap-1 overflow-x-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[50px] rounded-lg transition-colors ${
              isActive ? 'text-[#C7FF4A]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
