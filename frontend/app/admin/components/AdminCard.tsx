import { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  className?: string;
}

export function AdminCard({ children, className = '' }: AdminCardProps) {
  return (
    <div className={`card p-6 rounded-lg ${className}`}>
      {children}
    </div>
  );
}