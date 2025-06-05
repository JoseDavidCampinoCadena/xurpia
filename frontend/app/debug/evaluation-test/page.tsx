'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { evaluationsApi } from '@/app/api/evaluations.api';

export default function EvaluationTestPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testQuestions = [
    {
      id: 1,
      question: "What is JavaScript?",
      options: ["A programming language", "A database", "An operating system", "A framework"],
      correctAnswer: 0,
      difficulty: "easy" as const
    },
    {
      id: 2,
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Markup Language"],
      correctAnswer: 0,
      difficulty: "easy" as const
    }
  ];

  const testSubmission = async () => {
    if (!user) {
      setResult('User not authenticated');
      return;
    }

    setLoading(true);
    setResult('Testing submission...');

    try {
      console.log('🧪 Starting evaluation test...');
      console.log('User:', user);
      
      const testData = {
        profession: 'Frontend',
        technology: 'JavaScript',
        questions: testQuestions,
        userAnswers: [0, 0] // Both correct answers
      };

      console.log('📤 Submitting test data:', testData);

      const response = await evaluationsApi.submitEvaluation(
        testData.profession,
        testData.technology,
        testData.questions,
        testData.userAnswers
      );

      console.log('✅ Response received:', response);
      setResult(`Success: Score ${response.score}, Level ${response.level}`);
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      setResult(`Error: ${error?.response?.status} - ${error?.response?.data?.message || error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testQuestionGeneration = async () => {
    setLoading(true);
    setResult('Testing question generation...');

    try {
      console.log('🧪 Testing question generation...');
      
      const questions = await evaluationsApi.generateQuestions('Frontend', 'JavaScript');
      console.log('✅ Questions generated:', questions);
      setResult(`Questions generated successfully: ${questions.length} questions`);
    } catch (error: any) {
      console.error('❌ Question generation failed:', error);
      setResult(`Error: ${error?.response?.status} - ${error?.response?.data?.message || error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Evaluation API Test</h1>
      
      <div className="space-y-4 mb-8">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">User Info:</h2>
          <p>ID: {user?.id}</p>
          <p>Email: {user?.email}</p>
          <p>Name: {user?.name}</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <button
          onClick={testQuestionGeneration}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Question Generation'}
        </button>

        <button
          onClick={testSubmission}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 ml-4"
        >
          {loading ? 'Testing...' : 'Test Evaluation Submission'}
        </button>
      </div>

      <div className="p-4 bg-gray-50 rounded min-h-[100px]">
        <h3 className="font-semibold mb-2">Test Result:</h3>
        <pre className="whitespace-pre-wrap">{result}</pre>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Test Data:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(testQuestions, null, 2)}
        </pre>
      </div>
    </div>
  );
}
