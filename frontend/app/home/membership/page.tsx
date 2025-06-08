'use client';

import React from 'react';
import MembershipInfo from '@/app/components/MembershipInfo';

const MembershipPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mi Membresía
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu plan y revisa el uso de tus evaluaciones
        </p>
      </div>

      <MembershipInfo />
    </div>
  );
};

export default MembershipPage;
