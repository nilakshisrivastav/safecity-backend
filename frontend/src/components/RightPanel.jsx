import React, { useRef, useEffect, useState } from 'react';
import { Camera, Download, Activity, ScanFace, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function RightPanel({ uploadedImage, predictionResult, isAnalyzing, isCameraActive, analyzeFrame }) {
  const reportRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const analyzeInterval = useRef(null);
  const [mediaSize, setMediaSize] = useState({ w: 100, h: 100 });

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Start polling frames
      analyzeInterval.current = setInterval(captureAndAnalyze, 1000);
    } catch (err) {
      console.error("Camera access denied or error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (analyzeInterval.current) {
      clearInterval(analyzeInterval.current);
      analyzeInterval.current = null;
    }
  };

  const captureAndAnalyze = () => {
    if (!videoRef.current || !analyzeFrame) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!canvas.width || !canvas.height) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) analyzeFrame(blob);
    }, "image/jpeg", 0.8);
  };

  const handleVideoLoaded = (e) => {
    setMediaSize({ w: e.target.videoWidth, h: e.target.videoHeight });
  };

  const handleImageLoaded = (e) => {
    setMediaSize({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  };

  const generatePDF = async () => {
    if (!reportRef.current || !predictionResult) return;
    
    const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Add title
    pdf.setFontSize(22);
    pdf.setTextColor(40, 40, 40);
    pdf.text("SafeCity AI Incident Report", 15, 20);
    
    // Add meta info
    pdf.setFontSize(12);
    pdf.text(`Date & Time: ${new Date().toLocaleString()}`, 15, 30);
    pdf.text(`Incident Type: ${predictionResult?.top_prediction || 'N/A'}`, 15, 38);
    pdf.text(`Confidence Score: ${predictionResult?.confidence || 0}%`, 15, 46);
    
    // Draw snapshot
    pdf.addImage(imgData, 'PNG', 15, 55, pdfWidth - 30, (pdfWidth-30)*(canvas.height/canvas.width));
    
    pdf.save(`Incident_Report_${new Date().getTime()}.pdf`);
  };

  const renderBoundingBoxes = () => {
    if (!predictionResult || predictionResult.top_prediction === "No Detection" || !predictionResult.all_predictions) return null;

    return (
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        viewBox={`0 0 ${mediaSize.w} ${mediaSize.h}`} 
        preserveAspectRatio="xMidYMid meet"
      >
        {predictionResult.all_predictions.map((pred, idx) => {
          if (!pred.box || pred.box.length !== 4) return null;
          const [xmin, ymin, xmax, ymax] = pred.box;
          const x = xmin * mediaSize.w;
          const y = ymin * mediaSize.h;
          const width = (xmax - xmin) * mediaSize.w;
          const height = (ymax - ymin) * mediaSize.h;
          
          let color = "#ef4444"; // red
          if (pred.label === "Suspicious" || pred.label === "Crowd" || pred.label === "Red Light Violation") color = "#eab308"; // yellow
          
          return (
            <g key={idx}>
              <rect 
                x={x} y={y} width={width} height={height} 
                fill={`${color}33`} stroke={color} strokeWidth="3" 
                rx="4" ry="4"
              />
              <rect x={x - 1.5} y={y > 22 ? y - 22 : y} width={Math.max(120, pred.label.length * 8 + 40)} height="22" fill={color} rx="2" />
              <text x={x + 4} y={y > 22 ? y - 6 : y + 15} fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
                {pred.label} ({Math.round(pred.confidence)}%)
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl border border-gray-700 h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>

      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center justify-between">
        Live Monitor & Detection
        <ScanFace className="text-indigo-400" size={24} />
      </h2>

      {/* Detection Monitor Area */}
      <div 
        ref={reportRef} 
        className="flex-1 bg-black rounded-lg border border-gray-600 overflow-hidden relative group flex flex-col shadow-inner min-h-[300px]"
      >
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-gray-700">
          <Activity size={14} className="text-green-400" />
          <span className="text-xs text-green-400 font-mono tracking-wider uppercase font-semibold">Live Mode</span>
        </div>

        {/* Dynamic Image or Camera Stand-in */}
        <div className="flex-1 relative flex items-center justify-center bg-gray-900 w-full overflow-hidden">
          {isCameraActive ? (
            <>
               <video 
                 ref={videoRef} 
                 onLoadedMetadata={handleVideoLoaded}
                 className="object-contain h-full w-full opacity-90 transition-opacity duration-500" 
                 muted playsInline 
               />
               {renderBoundingBoxes()}
            </>
          ) : uploadedImage ? (
            <>
               <img 
                 src={URL.createObjectURL(uploadedImage)} 
                 onLoad={handleImageLoaded}
                 alt="Uploaded" 
                 className="object-contain h-full w-full opacity-90 transition-opacity duration-500" 
               />
               {/* Show loading overlay while analyzing explicitly for images */}
               {isAnalyzing && (
                 <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                   <ScanFace className="text-indigo-500 animate-spin" size={40} />
                   <p className="text-indigo-300 text-sm mt-4 font-mono w-40 text-center animate-pulse">Running YOLOv8 Analytics...</p>
                 </div>
               )}
               {/* Only show bounding boxes if not explicitly analyzing an image */}
               {!isAnalyzing && renderBoundingBoxes()}
            </>
          ) : (
            <div className="text-center text-gray-500 flex flex-col items-center gap-3 animate-pulse">
              <Camera size={48} className="opacity-50" />
              <p className="text-sm tracking-wide">Awaiting Feed / Upload Image</p>
            </div>
          )}
        </div>

        {/* Prediction Results Bar */}
        <div className="p-4 bg-gray-900 border-t border-gray-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-widest">Detection Status</p>
              {predictionResult ? (
                <div className="flex items-center gap-2">
                   {predictionResult.top_prediction === "No Detection" ? (
                      <CheckCircle className="text-green-500" size={18} />
                   ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                   )}
                   <p className={`font-bold text-lg ${predictionResult.top_prediction === 'No Detection' ? 'text-green-400' : 'text-red-400'}`}>
                    {predictionResult.top_prediction}
                   </p>
                </div>
              ) : (
                <p className="font-bold text-gray-500 text-lg">STANDBY</p>
              )}
            </div>
            {predictionResult && predictionResult.top_prediction !== "No Detection" && (
              <div className="bg-gray-800 rounded px-4 py-2 border border-gray-600 shadow-inner">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 text-right">Confidence</p>
                <p className="text-xl font-bold text-white text-right font-mono">{predictionResult.confidence}%</p>
              </div>
            )}
          </div>
          
          {/* List all detections */}
          {predictionResult && predictionResult.all_predictions?.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {predictionResult.all_predictions.map((pred, idx) => (
                <span key={idx} className="text-xs bg-gray-800 border border-gray-600 px-2 py-1 rounded text-gray-300 whitespace-nowrap">
                  {pred.label} {pred.confidence}%
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={generatePDF}
        disabled={!predictionResult || isAnalyzing}
        className="mt-auto w-full group relative flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-950 border border-gray-700 transition duration-300 py-3.5 rounded-lg shadow-lg disabled:opacity-50 overflow-hidden"
      >
         <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
         <Download size={20} className="text-gray-300 group-hover:text-white transition-colors" />
         <span className="font-medium text-gray-300 group-hover:text-white transition-colors tracking-wide">Generate PDF Report</span>
      </button>
    </div>
  );
}
