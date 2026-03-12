import React from 'react';
import { Video, ShieldAlert } from 'lucide-react';

export default function MultiCameraPanel() {
  const feeds = [
    { id: 'CAM-02', location: 'Main Street Intersection', status: 'Active' },
    { id: 'CAM-03', location: 'Downtown Mall', status: 'Active' },
    { id: 'CAM-04', location: 'Central Station', status: 'Warning', alert: 'Crowd Detected' },
    { id: 'CAM-05', location: 'North Avenue', status: 'Active' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4 shadow-xl border border-gray-700 h-full">
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center justify-between">
        Multi-Camera Monitoring
        <Video className="text-indigo-400" size={24} />
      </h2>
      <div className="grid grid-cols-2 gap-3 flex-1 min-h-[300px]">
        {feeds.map((feed) => (
          <div key={feed.id} className={`relative bg-black rounded-lg border flex flex-col items-center justify-center overflow-hidden ${feed.status === 'Warning' ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'border-gray-700'}`}>
             
             {/* Feed overlay mockup */}
             <div className="absolute top-2 left-2 flex gap-2 z-10">
               <span className="bg-black/60 text-gray-300 text-[10px] px-2 py-0.5 rounded backdrop-blur-sm border border-gray-600 font-mono">
                 {feed.id}
               </span>
               <span className="bg-black/60 text-gray-300 text-[10px] px-2 py-0.5 rounded backdrop-blur-sm border border-gray-600 font-sans hidden sm:block truncate max-w-[100px]">
                 {feed.location}
               </span>
             </div>
             
             {feed.status === 'Warning' && (
               <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10 animate-pulse">
                  <ShieldAlert size={12}/> {feed.alert}
               </div>
             )}

             <div className="opacity-30 text-gray-600 flex flex-col items-center gap-2">
                <Video size={32} />
                <span className="text-xs font-mono tracking-widest">{feed.status === 'Warning' ? 'REC - 24FPS (ALERT)' : 'REC - 24FPS'}</span>
             </div>
             
             <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
               <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${feed.status === 'Warning' ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${feed.status === 'Warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
               </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
