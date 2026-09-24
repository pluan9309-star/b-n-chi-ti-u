import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = '', size = 18, color }) => {
  // Safe lookup on LucideIcons
  const IconComponent = (LucideIcons as Record<string, any>)[name] || LucideIcons.Folder;

  return <IconComponent className={className} size={size} color={color} />;
};
