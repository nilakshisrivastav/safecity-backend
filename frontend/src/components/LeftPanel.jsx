import React, { useRef } from 'react';
import { Upload, Camera, AlertTriangle, XCircle } from 'lucide-react';

export default function LeftPanel({ onImageUpload, isAnalyzing, predictionResult, alertHistory, isCameraActive, onCameraToggle, apiError, onDismissError }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  // Determine Risk Level
  let riskLevel = "Low";
  let riskColor = "bg-green-500";
  
  if (predictionResult && predictionResult.top_prediction !== "No Detection" && predictionResult.confidence > 0) {
    if (predictionResult.top_prediction === "Fight" || predictionResult.top_prediction === "Fire/Smoke") {
      riskLevel = "High";
      riskColor = "bg-red-500";
    } else if (predictionResult.top_prediction === "Suspicious" || predictionResult.top_prediction === "Crowd" || predictionResult.top_prediction === "Red Light Violation") {
      riskLevel = "Medium";
      riskColor = "bg-yellow-500";
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl border border-gray-700">
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex justify-between items-center">
        Controls & Alerts
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
        </span>
      </h2>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 transition duration-300 py-3 rounded-lg font-medium shadow-lg disabled:opacity-50"
        >
          <Upload size={20} />
          {isAnalyzing ? "Analyzing..." : "Upload Image"}
        </button>
        <button 
          onClick={onCameraToggle}
          className={`flex items-center justify-center gap-2 w-full transition duration-300 py-3 rounded-lg font-medium shadow-lg ${isCameraActive ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          <Camera size={20} />
          {isCameraActive ? "Stop Camera" : "Launch Camera"}
        </button>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="bg-red-900/40 border border-red-500/60 rounded-lg px-4 py-3 flex items-start gap-3">
          <XCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-300 text-xs font-semibold uppercase tracking-wider mb-0.5">Backend Connection Error</p>
            <p className="text-red-200 text-xs leading-snug">{apiError}</p>
          </div>
          <button onClick={onDismissError} className="text-red-400 hover:text-red-200 transition-colors flex-shrink-0" aria-label="Dismiss error">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Risk Meter */}
      <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 mt-2">
        <h3 className="text-sm text-gray-400 mb-3 uppercase tracking-wider font-semibold">Current Risk Level</h3>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-500 ${riskColor}`}>
            <span className="font-bold text-white text-lg">{riskLevel}</span>
          </div>
          <div className="flex-1">
            <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500 w-1/3 transition-opacity" style={{ opacity: riskLevel === 'Low' ? 1 : 0.3 }}></div>
              <div className="h-full bg-yellow-500 w-1/3 transition-opacity" style={{ opacity: riskLevel === 'Medium' || riskLevel === 'High' ? 1 : 0.3 }}></div>
              <div className="h-full bg-red-500 w-1/3 transition-opacity" style={{ opacity: riskLevel === 'High' ? 1 : 0.3 }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Low</span>
              <span>Med</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Panel */}
      <div className="space-y-3 flex-1 overflow-y-auto mt-2 pr-1 custom-scrollbar">
        <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Recent Alerts</h3>
        <div className="flex flex-col gap-3">
          {alertHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-4 text-sm">No incidents detected yet</div>
          ) : (
            alertHistory.map((alert, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 flex items-start gap-3">
                <AlertTriangle size={18} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm text-gray-100">{alert.type}</span>
                    <span className="text-xs text-gray-400">{alert.time}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Conf: {alert.confidence}%</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
