"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import dynamic from "next/dynamic";

const MarkerClusterGroup = dynamic(
    () => import('react-leaflet-cluster'),
    { ssr: false }
);

// Fix for default marker icons in Leaflet with Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom orange marker for EV stations
const evIcon = new L.Icon({
    iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y5NzMxNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDEwYzAgNC45OTMtNS41MzkgMTAuMTkzLTcuMzk5IDExLjc5OWExIDEgMCAwIDEtMS4yMDIgMEM5LjUzOSAyMC4xOTMgNCAxNC45OTMgNCAxMGE4IDggMCAwIDEgMTYgMHoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIiBmaWxsPSIjZmZmIi8+PC9zdmc+",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Component to handle map center changes
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [map, center[0], center[1], zoom]);
    return null;
}

// Fix for missing tiles / grey areas when container resizes
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        const container = map.getContainer();
        resizeObserver.observe(container);
        
        // Ensure size is invalidated shortly after mount
        setTimeout(() => map.invalidateSize(), 200);
        
        return () => resizeObserver.disconnect();
    }, [map]);
    return null;
}

function BoundsTracker({ onBoundsChange }: { onBoundsChange: (b: L.LatLngBounds) => void }) {
    const map = useMap();
    useEffect(() => {
        const handler = () => onBoundsChange(map.getBounds());
        map.on('moveend', handler);
        map.on('zoomend', handler);
        handler(); // set initial bounds
        return () => { 
            map.off('moveend', handler); 
            map.off('zoomend', handler); 
        };
    }, [map, onBoundsChange]);
    return null;
}

import type { NormalizedStation } from '@/lib/normalizeStation';

export default function StationMap({ 
    userLat, 
    userLon, 
    stations 
}: { 
    userLat: number | null, 
    userLon: number | null, 
    stations: NormalizedStation[] 
}) {
    // Default center to Jakarta if no user location
    const center: [number, number] = [userLat ?? -6.2088, userLon ?? 106.8456];

    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

    const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
        setMapBounds(bounds);
    }, []);

    const visibleStations = useMemo(() => {
        if (!mapBounds || !stations?.length) return [];
        const expanded = mapBounds.pad(0.15);
        return stations
            .map(s => ({
                ...s,
                lat: s.lat,
                lon: s.lon
            }))
            .filter(s =>
                s.lat != null &&
                s.lon != null &&
                expanded.contains([s.lat, s.lon])
            );
    }, [stations, mapBounds]);

    return (
        <MapContainer 
            center={center} 
            zoom={13} 
            scrollWheelZoom={true} 
            style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* Global style to force popup styling for dark mode compatibility */}
            <style>{`
                .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                    background: var(--surface);
                    color: var(--ink);
                    border: 1px solid var(--border);
                }
                .leaflet-popup-close-button {
                    color: var(--ink-muted) !important;
                }
            `}</style>
            
            <MapResizer />
            <BoundsTracker onBoundsChange={handleBoundsChange} />
            <ChangeView center={center} zoom={13} />

            {/* User Location Marker */}
            {userLat && userLon && (
                <Marker position={[userLat, userLon]}>
                    <Popup>
                        <div className="text-center font-semibold text-blue-600">You are here</div>
                    </Popup>
                </Marker>
            )}

            {/* Station Markers */}
            <MarkerClusterGroup
                chunkedLoading={true}
                maxClusterRadius={80}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
                animate={false}
            >
                {visibleStations.map((station) => {
                    const isOp = station.isOperational;
                    const statusColor = isOp === true ? "bg-emerald-500" : isOp === false ? "bg-red-500" : "bg-gray-400";
                    
                    return (
                        <Marker 
                            key={station.id} 
                            position={[station.lat, station.lon]}
                            icon={evIcon}
                        >
                            <Popup>
                                <div className="font-sans min-w-[220px]">
                                    <h3 className="font-bold text-base m-0 text-[var(--ink)]">{station.name}</h3>
                                    <p className="text-xs text-[var(--ink-muted)] m-0 mt-1">{station.operator}</p>
                                    
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--ink-muted)] border-b border-[var(--border)] pb-2">
                                        <div className={`h-2 w-2 rounded-full ${statusColor}`} />
                                        {isOp === true ? "Operational" : isOp === false ? "Offline" : "Unknown Status"}
                                        <span className="ml-auto font-semibold text-orange-500">{station.distanceKm?.toFixed(1) || "?"} km away</span>
                                    </div>
                                    
                                    <div className="mt-2 flex flex-col gap-1.5 max-h-32 overflow-y-auto no-scrollbar">
                                        {station.connectors?.map((c, idx) => {
                                            let type = c.type
                                                .replace(" (Mennekes)", "")
                                                .replace(" (Combo)", "")
                                                .replace(" (Socket Only)", "")
                                                .replace(" (Tethered Connector)", "")
                                                .replace("CCS (Type 2)", "CCS2");
                                                
                                            const t = type.toUpperCase();
                                            if (t.includes("AC") && !t.includes(" AC")) type += " AC";
                                            else if (t.includes("DC") && !t.includes(" DC")) type += " DC";
                                            
                                            const kw = c.powerKw ? `${c.powerKw}kW` : "";
                                            const qty = c.quantity ? `(x${c.quantity})` : "";
                                            return (
                                                <div key={idx} className="flex justify-between items-center bg-[var(--surface-2)] rounded px-2 py-1 text-[11px] font-semibold text-[var(--ink)]">
                                                    <span>{type} {qty}</span>
                                                    {kw && <span className="text-orange-500">{kw}</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>
        </MapContainer>
    );
}
