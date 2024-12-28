export function AdminCard({ children, className = '' }) {
  return (
    <div className={`card p-6 rounded-lg ${className}`}>
      {children}
    </div>
  );
} 