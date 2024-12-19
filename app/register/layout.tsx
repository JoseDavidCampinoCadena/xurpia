import React from 'react';


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1>Registro</h1>
      {children}
    </div>
  );
}
