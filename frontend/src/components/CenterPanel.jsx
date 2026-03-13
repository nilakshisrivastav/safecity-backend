import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CenterPanel({ predictionResult }) {
  // Chart Data State
  const [barStats, setBarStats] = useState([0, 0, 0, 0, 0]); // Starts empty – populated from real API data
  const [lineStats, setLineStats] = useState([0, 0, 0, 0, 0, 0, 0]); // Starts empty – populated from real API data

  useEffect(() => {
    if (!predictionResult || predictionResult.top_prediction === "No Detection" || !predictionResult.all_predictions) {
      return;
    }

    // Determine counts from current prediction
    const currentCounts = {
      'Fight': 0,
      'Crowd': 0,
      'Suspicious': 0,
      'Red Light Violation': 0,
      'Fire/Smoke': 0
    };

    predictionResult.all_predictions.forEach(pred => {
      if (currentCounts[pred.label] !== undefined) {
        currentCounts[pred.label] += 1;
      }
    });

    // Update Bar Chart
    // Labels match: ['Fight', 'Crowd', 'Suspicious', 'Red Light', 'Fire/Smoke']
    setBarStats(prev => {
      const newStats = [...prev];
      newStats[0] += currentCounts['Fight'];
      newStats[1] += currentCounts['Crowd'];
      newStats[2] += currentCounts['Suspicious'];
      newStats[3] += currentCounts['Red Light Violation']; // Maps to "Red Light"
      newStats[4] += currentCounts['Fire/Smoke'];
      return newStats;
    });

    // Update Line Chart dynamically
    // Increment the last node to simulate real-time current-hour trends
    const totalNewIncidents = Object.values(currentCounts).reduce((a, b) => a + b, 0);
    if (totalNewIncidents > 0) {
      setLineStats(prev => {
        const newStats = [...prev];
        newStats[newStats.length - 1] += totalNewIncidents;
        return newStats;
      });
    }

  }, [predictionResult]);

  const barData = {
    labels: ['Fight', 'Crowd', 'Suspicious', 'Red Light', 'Fire/Smoke'],
    datasets: [
      {
        label: 'Incident Types (Today)',
        data: barStats,
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(249, 115, 22, 0.7)',
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(99, 102, 241, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const lineData = {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
    datasets: [
      {
        fill: true,
        label: 'Incident Trend (Last 12 hours)',
        data: lineStats,
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: { family: "'Inter', sans-serif" }
        }
      },
    },
    scales: {
      y: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { color: '#334155' },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl border border-gray-700 h-full">
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
        Analytics & Trends
      </h2>

      <div className="flex-1 min-h-[250px] bg-gray-900 rounded-lg p-4 border border-gray-700 relative">
        <h3 className="text-sm text-gray-400 mb-2 font-semibold absolute top-4 left-4 z-10">Incident Types</h3>
        <div className="h-full pt-6">
          <Bar data={barData} options={options} />
        </div>
      </div>

      <div className="flex-1 min-h-[250px] bg-gray-900 rounded-lg p-4 border border-gray-700 relative">
        <h3 className="text-sm text-gray-400 mb-2 font-semibold absolute top-4 left-4 z-10">Incident Trend</h3>
        <div className="h-full pt-6">
          <Line data={lineData} options={options} />
        </div>
      </div>
    </div>
  );
}
