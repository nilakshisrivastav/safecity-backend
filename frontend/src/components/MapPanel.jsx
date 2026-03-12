import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix typical Leaflet invisible icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a custom red icon for high risk
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultCenter = [28.6139, 77.2090]; // Static New Delhi coord.

function MapUpdater({ incidents }) {
  const map = useMap();
  useEffect(() => {
    if (incidents && incidents.length > 0) {
      // Pan to the newest coordinate
      const latest = incidents[0];
      if (latest.lat && latest.lng) {
        map.setView([latest.lat, latest.lng], 13);
      }
    }
  }, [incidents, map]);
  return null;
}

export default function MapPanel({ incidents }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4 shadow-xl border border-gray-700 h-full relative">
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex justify-between items-center">
        Live Incident Map
        <MapPin className="text-indigo-400" size={24} />
      </h2>
      <div className="flex-1 rounded-lg overflow-hidden border border-gray-600 min-h-[300px]">
        <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&amp;copy <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater incidents={incidents} />
          {incidents.map((inc, i) => (
            inc.lat && inc.lng && (
            <Marker key={i} position={[inc.lat, inc.lng]} icon={inc.risk === 'High' ? redIcon : new L.Icon.Default()}>
              <Popup>
                <strong>{inc.type}</strong><br/>
                Confidence: {inc.confidence}%<br/>
                Time: {inc.time}
              </Popup>
            </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
