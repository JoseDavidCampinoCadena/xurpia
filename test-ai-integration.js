// Test script to verify AI project analysis functionality
// Using built-in fetch (Node.js 18+)

const testAIAnalysis = async () => {
  try {
    console.log('🧪 Testing AI Project Analysis API...');
    
    const response = await fetch('http://localhost:3001/ai/analyze-project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName: 'Heeq - App para Parqueaderos',
        projectContext: 'Somos una empresa encargada de crear una aplicación para parqueaderos en Java. Los usuarios podrán reservar espacios, gestionar pagos y recibir notificaciones en tiempo real usando Spring Boot y React.',
        estimatedDuration: '6 meses'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ AI Analysis successful!');
      console.log('📊 Results:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ API call failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Error testing AI analysis:', error.message);
  }
};

// Run the test
testAIAnalysis();
