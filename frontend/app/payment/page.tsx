"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaCrown, FaCheck, FaArrowLeft, FaCreditCard, FaShieldAlt } from "react-icons/fa";
import { membershipApi } from "@/app/api/membership.api";

interface PlanDetails {
  type: 'PRO' | 'ENTERPRISE';
  name: string;
  price: string;
  priceAmount: number;
  originalPrice?: string;
  features: string[];
  color: string;
  icon: React.ReactElement;
  description: string;
}

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planType = searchParams.get('plan') as 'PRO' | 'ENTERPRISE';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const plans: Record<'PRO' | 'ENTERPRISE', PlanDetails> = {
    PRO: {
      type: 'PRO',
      name: 'Plan PRO',
      price: '$30,000 COP/mes',
      priceAmount: 30000,
      originalPrice: '$45,000 COP/mes',
      features: [
        '3 evaluaciones por tecnología por proyecto',
        'Análisis detallado de código',
        'Reportes avanzados',
        'Soporte prioritario',
        'Historial completo de evaluaciones',
        'Exportación de reportes en PDF'
      ],
      color: 'blue',
      icon: <FaCrown className="text-blue-400" />,
      description: 'Perfecto para desarrolladores profesionales y equipos pequeños'
    },
    ENTERPRISE: {
      type: 'ENTERPRISE',
      name: 'Plan ENTERPRISE',
      price: '$120,000 COP/mes',
      priceAmount: 120000,
      originalPrice: '$180,000 COP/mes',
      features: [
        'Evaluaciones ilimitadas',
        'Análisis de código en tiempo real',
        'Integración con CI/CD',
        'Soporte 24/7 dedicado',
        'Dashboard de analytics avanzado',
        'API personalizada',
        'Gestión de equipos',
        'Reportes personalizados'
      ],
      color: 'yellow',
      icon: <FaCrown className="text-yellow-400" />,
      description: 'Ideal para empresas y equipos grandes que requieren máxima flexibilidad'
    }
  };

  const selectedPlan = planType ? plans[planType] : null;

  useEffect(() => {
    if (!planType || !selectedPlan) {
      router.push('/home/settings/profile');
    }
  }, [planType, selectedPlan, router]);

  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Validar datos de tarjeta
      if (paymentMethod === 'card') {
        if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
          setError("Por favor completa todos los campos de la tarjeta");
          return;
        }
      }

      // Simular procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar membresía
      await membershipApi.upgradeMembership(selectedPlan.type);
      
      // Redirigir con éxito
      router.push('/home/settings/profile?payment=success');
    } catch (err) {
      setError("Error al procesar el pago. Por favor intenta nuevamente.");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (!selectedPlan) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <FaArrowLeft />
            Volver
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Actualizar a {selectedPlan.name}</h1>
            <p className="text-gray-400">{selectedPlan.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  {selectedPlan.icon}
                </div>
                <h2 className="text-2xl font-bold mb-2">{selectedPlan.name}</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-3xl font-bold text-[#26D07C]">{selectedPlan.price}</span>
                  {selectedPlan.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">{selectedPlan.originalPrice}</span>
                  )}
                </div>
                {selectedPlan.originalPrice && (
                  <div className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    33% de descuento
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-3">Características incluidas:</h3>
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <FaCheck className="text-green-400 w-4 h-4 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <FaShieldAlt />
                  <span className="font-medium">Garantía de satisfacción</span>
                </div>
                <p className="text-sm text-gray-300">
                  Cancela en cualquier momento. Garantía de devolución de 30 días.
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6">Información de pago</h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Método de pago</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                      paymentMethod === 'card'
                        ? 'border-[#26D07C] bg-[#26D07C]/10 text-[#26D07C]'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <FaCreditCard />
                    Tarjeta
                  </button>
                  <button
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                      paymentMethod === 'paypal'
                        ? 'border-[#26D07C] bg-[#26D07C]/10 text-[#26D07C]'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <span>💳</span>
                    PayPal
                  </button>
                </div>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Número de tarjeta</label>                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                      className="w-full px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 rounded-lg transition-all duration-300"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Vencimiento</label>                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                        className="w-full px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 rounded-lg transition-all duration-300"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>                      <input
                        type="text"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                        className="w-full px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 rounded-lg transition-all duration-300"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre en la tarjeta</label>                    <input
                      type="text"
                      placeholder="Juan Pérez"
                      value={cardData.name}
                      onChange={(e) => setCardData({...cardData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-black/30 border border-green-400/30 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none text-white placeholder-green-200/50 rounded-lg transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* PayPal Payment */}
              {paymentMethod === 'paypal' && (
                <div className="mb-6 p-4 bg-gray-700 rounded-lg text-center">
                  <p className="text-sm text-gray-300 mb-4">
                    Serás redirigido a PayPal para completar el pago de forma segura.
                  </p>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-3">Resumen del pedido</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">{selectedPlan.name}</span>
                  <span>{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">IVA (19%)</span>
                  <span>${Math.round(selectedPlan.priceAmount * 0.19).toLocaleString()} COP</span>
                </div>
                <hr className="border-gray-600 my-2" />
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span className="text-[#26D07C]">
                    ${Math.round(selectedPlan.priceAmount * 1.19).toLocaleString()} COP
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#26D07C] hover:bg-[#1bb86c] text-white py-4 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando pago...' : `Pagar ${selectedPlan.price}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                Al completar el pago, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
