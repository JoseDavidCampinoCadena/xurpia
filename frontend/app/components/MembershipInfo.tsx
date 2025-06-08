'use client';

import React from 'react';
import { useMembership } from '@/app/hooks/useMembership';
import { FaCrown, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const MembershipInfo: React.FC = () => {
  const { 
    membershipInfo, 
    evaluationUsage, 
    loading, 
    error,
    getMembershipStatus,
    upgradeMembership 
  } = useMembership();

  const handleUpgrade = async (membershipType: 'PRO' | 'ENTERPRISE') => {
    try {
      await upgradeMembership(membershipType);
      alert(`¡Membresía actualizada a ${membershipType} exitosamente!`);
    } catch (err) {
      alert('Error al actualizar membresía. Por favor intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando información de membresía...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!membershipInfo) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
        <p className="text-yellow-600 dark:text-yellow-400">No se pudo cargar la información de membresía</p>
      </div>
    );
  }

  const membershipStatus = getMembershipStatus();

  const getMembershipIcon = (type: string) => {
    switch (type) {
      case 'PRO':
        return <FaCrown className="text-yellow-500" />;
      case 'ENTERPRISE':
        return <FaCrown className="text-purple-500" />;
      default:
        return <FaCheck className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Membership Card */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getMembershipIcon(membershipInfo.type)}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Plan {membershipInfo.type}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{membershipInfo.price}</p>
            </div>
          </div>
          
          {membershipStatus && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${membershipStatus.color} bg-opacity-10`}>
              {membershipStatus.message}
            </span>
          )}
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Limitaciones de Evaluaciones:</h4>
          <p className="text-gray-600 dark:text-gray-400">{membershipInfo.evaluationLimits.description}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Características incluidas:</h4>
          <ul className="space-y-1">
            {membershipInfo.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <FaCheck className="text-green-500 text-xs" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade buttons */}
        <div className="mt-6 flex gap-3">
          {membershipInfo.type === 'FREE' && (
            <>
              <button
                onClick={() => handleUpgrade('PRO')}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Actualizar a PRO
              </button>
              <button
                onClick={() => handleUpgrade('ENTERPRISE')}
                className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                Actualizar a ENTERPRISE
              </button>
            </>
          )}
          
          {membershipInfo.type === 'PRO' && (
            <button
              onClick={() => handleUpgrade('ENTERPRISE')}
              className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
            >
              Actualizar a ENTERPRISE
            </button>
          )}
        </div>
      </div>

      {/* Evaluation Usage */}
      {evaluationUsage.length > 0 && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Uso de Evaluaciones
          </h3>
          
          <div className="space-y-3">
            {evaluationUsage.map((usage, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {usage.projectName} - {usage.technology}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {usage.count}/{usage.limit === Infinity ? '∞' : usage.limit} evaluaciones utilizadas
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {usage.remaining > 0 ? (
                    <FaCheck className="text-green-500" />
                  ) : usage.limit === Infinity ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    usage.remaining > 0 || usage.limit === Infinity 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {usage.limit === Infinity ? 'Ilimitadas' : 
                     usage.remaining > 0 ? `${usage.remaining} restantes` : 'Límite alcanzado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipInfo;
