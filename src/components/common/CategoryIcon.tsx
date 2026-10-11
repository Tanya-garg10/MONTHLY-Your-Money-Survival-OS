import React from 'react';
import {
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  Film,
  Sparkles,
  ShieldAlert,
  MoreHorizontal,
  Music,
  Tv,
  Smartphone,
  Cloud,
  HelpCircle,
  LucideProps,
} from 'lucide-react';
import { CategoryId } from '../../types/finance';

interface CategoryIconProps extends LucideProps {
  name: CategoryId | string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name) {
    case 'food':
    case 'Utensils':
      return <Utensils {...props} />;
    case 'transport':
    case 'Car':
      return <Car {...props} />;
    case 'bills':
    case 'Receipt':
      return <Receipt {...props} />;
    case 'shopping':
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'entertainment':
    case 'Film':
      return <Film {...props} />;
    case 'personal_care':
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'emergency':
    case 'ShieldAlert':
      return <ShieldAlert {...props} />;
    case 'Music':
      return <Music {...props} />;
    case 'Tv':
      return <Tv {...props} />;
    case 'Smartphone':
      return <Smartphone {...props} />;
    case 'Cloud':
      return <Cloud {...props} />;
    case 'other':
    case 'MoreHorizontal':
    default:
      return <MoreHorizontal {...props} />;
  }
};
