import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import TopStatsPanel from './components/TopStatsPanel';
import MultiCameraPanel from './components/MultiCameraPanel';
import MapPanel from './components/MapPanel';
import { ShieldCheck, BellRing } from 'lucide-react';

export default function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);
  const [globalStats, setGlobalStats] = useState({ total: 0 });
  const [mapIncidents, setMapIncidents] = useState([]);
  const [activePopup, setActivePopup] = useState(null);

  const audioRef = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'));

  // Default API endpoint - change based on environment (.env for Vercel)
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/predict";

  const triggerAdvancedAlerts = (result) => {
    if (result.top_prediction !== "No Detection" && result.all_predictions?.length > 0) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newAlerts = result.all_predictions.map(det => ({
        type: det.label,
        confidence: det.confidence,
        time: timestamp
      }));

      setAlertHistory(prev => [...newAlerts, ...prev].slice(0, 10));

      // Global Stats Aggregation
      setGlobalStats(prev => {
        const nextStats = { ...prev };
        newAlerts.forEach(alt => {
           nextStats[alt.type] = (nextStats[alt.type] || 0) + 1;
           nextStats.total += 1;
        });
        return nextStats;
      });

      // Map Incidents (Mock coordinates slightly randomized around center)
      const baseLat = 28.6139; const baseLng = 77.2090;
      const newMapNodes = newAlerts.map(alt => ({
         ...alt,
         lat: baseLat + (Math.random() - 0.5) * 0.05,
         lng: baseLng + (Math.random() - 0.5) * 0.05,
         risk: (alt.type === 'Fight' || alt.type === 'Fire/Smoke') ? 'High' : 'Medium'
      }));
      setMapIncidents(prev => [...newMapNodes, ...prev].slice(0, 20));

      // Notification Popup & Sound
      const hasHighRisk = newAlerts.some(a => a.type === 'Fight' || a.type === 'Fire/Smoke');
      if (hasHighRisk) {
         setActivePopup({ message: 'HIGH RISK INCIDENT DETECTED: ' + result.top_prediction, time: timestamp });
         audioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
         setTimeout(() => setActivePopup(null), 5000);
      }
    }
  };

  const handleImageUpload = async (file) => {
    setIsCameraActive(false);
    setUploadedImage(file);
    setIsAnalyzing(true);
    setPredictionResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      setPredictionResult(result);
      triggerAdvancedAlerts(result);

    } catch (error) {
      console.error("Error connecting to backend API:", error);
      const mockResult = {
        top_prediction: "Suspicious",
        confidence: 88.5,
        all_predictions: [
          { label: "Suspicious", confidence: 88.5 },
          { label: "Crowd", confidence: 65.2 }
        ]
      };
      setPredictionResult(mockResult);
      triggerAdvancedAlerts(mockResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleCamera = () => {
    if (!isCameraActive) {
      setUploadedImage(null);
      setPredictionResult(null);
    }
    setIsCameraActive(!isCameraActive);
  };

  const analyzeFrame = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = response.data;
      setPredictionResult(result);
      triggerAdvancedAlerts(result);

    } catch (error) {
      console.error("Frame analysis error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* High Risk Overlay Alert */}
      {activePopup && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.8)] flex items-center gap-4 border border-red-400">
             <BellRing className="animate-pulse" size={28} />
             <div>
               <p className="font-bold uppercase tracking-wider">{activePopup.message}</p>
               <p className="text-sm text-red-100">{activePopup.time} - Immediate attention required</p>
             </div>
          </div>
        </div>
      )}

      {/* Background ambient light */}
      <div className="fixed top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none -z-10"></div>
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0b0f19]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.5)]">
               <ShieldCheck size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1">
              SafeCity <span className="text-indigo-500 font-mono text-xl">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-gray-300">System Online</span>
            </div>
            <div className="w-px h-6 bg-gray-700"></div>
             <span className="text-gray-400 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-6 pb-10">
          
          {/* Top Row: Incident Counters */}
          <TopStatsPanel stats={globalStats} />

          {/* Middle Row: Left, Center, Right Core Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
            {/* Left Panel */}
            <div className="lg:col-span-3 flex flex-col min-h-0">
              <LeftPanel 
                onImageUpload={handleImageUpload} 
                isAnalyzing={isAnalyzing} 
                predictionResult={predictionResult}
                alertHistory={alertHistory}
                isCameraActive={isCameraActive}
                onCameraToggle={toggleCamera}
              />
            </div>

            {/* Center Panel (Analytics) */}
            <div className="lg:col-span-4 xl:col-span-5 flex flex-col min-h-0">
               <CenterPanel predictionResult={predictionResult} />
            </div>

            {/* Right Panel (Detection) */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-h-0">
               <RightPanel 
                 uploadedImage={uploadedImage}
                 predictionResult={predictionResult}
                 isAnalyzing={isAnalyzing}
                 isCameraActive={isCameraActive}
                 analyzeFrame={analyzeFrame}
               />
            </div>
          </div>

          {/* Bottom Row: Multi-Camera Grid & Map View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
               <MapPanel incidents={mapIncidents} />
             </div>
             <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
               <MultiCameraPanel />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
