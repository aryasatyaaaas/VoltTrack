"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Search, MapPin, Navigation, Navigation2, Zap, Plug, Map as MapIcon } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useDebouncedCallback } from 'use-debounce';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import type { NormalizedStation } from "@/lib/normalizeStation";

const MapWithNoSSR = dynamic(() => import("@/components/map/StationMap"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-[#FDFBF7] shadow-inner text-gray-400">
            <MapIcon className="h-10 w-10 mb-2 animate-pulse" />
            <p className="text-sm font-semibold">Loading map...</p>
        </div>
    )
});
import { getCurrencySymbol } from "@/lib/utils";
import { useStations } from "@/hooks/useStations";

// --- Constants ---

const FILTERS = ["All", "AC", "CCS2", "CHAdeMO", "Fast Charging (>50kW)", "Available Now"];
const RADII = [5, 10, 25, 50, 10000];

export default function StationPage() {
    const router = useRouter();
    
    // --- State ---
    const [visibleCount, setVisibleCount] = useState(5);
    
    // Search & Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [radius, setRadius] = useState<number>(10);
    
    // Location state
    const [userLat, setUserLat] = useState<number | null>(null);
    const [userLon, setUserLon] = useState<number | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    // --- Helpers ---
    const formatConnectionType = (title: string) => {
        return title
            .replace(" (Mennekes)", "")
            .replace(" (Combo)", "")
            .replace(" (Socket Only)", "")
            .replace(" (Tethered Connector)", "")
            .replace("CCS (Type 2)", "CCS2");
    };

    const [searchError, setSearchError] = useState<string | null>(null);

    const { data: stationsData, isLoading: loading, isError } = useStations({
        lat: userLat,
        lon: userLon,
        distance: 10000,
        maxresults: 10000
    });
    const stations: NormalizedStation[] = stationsData || [];
    const error = searchError || (isError ? "Could not fetch stations. Check your connection." : null);

    // --- Geolocation ---
    const requestLocation = () => {
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setUserLat(lat);
                setUserLon(lon);
            },
            (err) => {
                setLocationError("Enable location to find nearby stations");
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Initial load - try to get location
    useEffect(() => {
        requestLocation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Haversine distance calculator
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;  
        const dLon = (lon2 - lon1) * Math.PI / 180; 
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; 
    };

    const handleSearch = useDebouncedCallback((value: string) => {
        setSearchQuery(value);
        if (!value.trim()) return;

        const query = value.toLowerCase();
        
        // Find best matching station by title or city
        const targetStation = stations.find(s => 
            s.name.toLowerCase().includes(query) ||
            s.address.toLowerCase().includes(query)
        );

        if (targetStation) {
            setUserLat(targetStation.lat);
            setUserLon(targetStation.lon);
            setVisibleCount(5);
            setActiveFilter("All");
        } else {
            setSearchError(`No station or city found matching "${value}"`);
            setTimeout(() => setSearchError(null), 3000);
        }
    }, 400);

    // Handle Radius Change
    const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRadius = parseInt(e.target.value);
        setRadius(newRadius);
    };

    // --- Filtering Logic (Single-Pass) ---
    const listStations = useMemo(() => {
        if (!stations?.length) return [];
        return stations.filter(s => {
            // Distance filter
            if (radius && radius !== 10000 && s.distanceKm > radius) return false;

            // Type/Status filter
            if (activeFilter === "All") return true;
            if (activeFilter === "Available Now") return s.isOperational === true;
            
            const hasAC = s.connectors.some(c => {
                const t = c.type.toUpperCase();
                return (t.includes("AC") || t.includes("TYPE 2")) && !t.includes("CCS");
            });
            const hasCCS2 = s.connectors.some(c => c.type.toUpperCase().includes("CCS"));
            const hasChademo = s.connectors.some(c => c.type.toUpperCase().includes("CHADEMO"));
            const isFast = s.connectors.some(c => (c.powerKw || 0) > 50);

            switch (activeFilter) {
                case "AC": return hasAC;
                case "CCS2": return hasCCS2;
                case "CHAdeMO": return hasChademo;
                case "Fast Charging (>50kW)": return isFast;
                default: return true;
            }
        });
    }, [stations, activeFilter, radius]);

    const handleLogCharge = (station: NormalizedStation) => {
        const name = encodeURIComponent(station.name);
        let type = "";
        
        if (station.connectors?.length > 0) {
            const types = station.connectors.map(c => c.type.toUpperCase());
            if (types.some(t => t.includes("CCS"))) type = "CCS2";
            else if (types.some(t => t.includes("CHADEMO"))) type = "CHAdeMO";
            else if (types.some(t => t.includes("AC") || t.includes("TYPE 2"))) type = "AC";
        }

        router.push(`/charging?location=${name}${type ? `&type=${type}` : ""}`);
    };

    return (
        <div className="flex h-full flex-col gap-4 overflow-hidden">
            {/* --- HEADER --- */}
            <div className="flex-shrink-0 space-y-4 pt-2">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--ink)]">
                        <MapPin className="h-6 w-6 text-orange-500" />
                        Station
                    </h1>
                    <p className="text-sm text-[var(--ink-muted)]">Find nearby SPKLU in Indonesia</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <form onSubmit={(e) => e.preventDefault()} className="relative flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                defaultValue={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search station name or city..."
                                className="w-full rounded-2xl border border-[var(--border)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--ink)] shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            />
                        </div>
                        <button type="button" onClick={() => handleSearch(searchQuery)} className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95">
                            Search
                        </button>
                    </form>
                    <button
                        onClick={requestLocation}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100"
                    >
                        <Navigation2 className="h-4 w-4" />
                        Use My Location
                    </button>
                </div>

                {/* --- FILTER BAR --- */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => { setActiveFilter(f); setVisibleCount(5); }}
                                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                                    activeFilter === f
                                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                        : "bg-white text-[var(--ink-muted)] border border-[var(--border)] hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex-shrink-0">
                        <select
                            value={radius}
                            onChange={handleRadiusChange}
                            className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] shadow-sm outline-none focus:border-orange-500"
                        >
                            {RADII.map(r => (
                                <option key={r} value={r}>{r === 10000 ? "All" : `${r} km Radius`}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {locationError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-center gap-2 font-semibold">
                        <Navigation className="h-4 w-4" />
                        {locationError}
                    </div>
                    <p className="mt-1 text-xs opacity-80">You can still try searching by city name above.</p>
                </div>
            )}
            
            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* --- MAIN CONTENT (Split View) --- */}
            <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row pb-6">
                
                {/* LEFT: Station List */}
                <div className="flex flex-col min-h-0 w-full lg:w-[40%] overflow-y-auto pr-1 no-scrollbar space-y-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="h-5 w-1/2 rounded bg-gray-200"></div>
                                    <div className="h-5 w-12 rounded-full bg-orange-100"></div>
                                </div>
                                <div className="mb-4 h-3 w-1/4 rounded bg-gray-100"></div>
                                <div className="mb-4 flex gap-2">
                                    <div className="h-6 w-16 rounded-full bg-gray-100"></div>
                                    <div className="h-6 w-16 rounded-full bg-gray-100"></div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="h-3 w-1/3 rounded bg-gray-100"></div>
                                    <div className="h-8 w-28 rounded-lg bg-gray-100"></div>
                                </div>
                            </div>
                        ))
                    ) : listStations.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                                <MapPin className="h-8 w-8 text-orange-400" />
                            </div>
                            <h3 className="mb-2 text-base font-bold text-[var(--ink)]">No stations found nearby</h3>
                            <p className="text-sm text-[var(--ink-muted)]">Try increasing the search radius or changing your filters.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {listStations.slice(0, visibleCount).map((station, i) => {
                                const isOp = station.isOperational;
                                const statusColor = isOp === true ? "bg-emerald-500" : isOp === false ? "bg-red-500" : "bg-gray-400";
                                const distance = station.distanceKm?.toFixed(1) || "?";
                                
                                return (
                                    <m.div
                                        key={station.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-md bg-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
                                        
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-base font-bold text-[var(--ink)] leading-tight">
                                                {station.name}
                                            </h3>
                                            <span className="flex-shrink-0 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                                                {distance} km
                                            </span>
                                        </div>
                                        
                                        <p className="mt-1 text-xs text-[var(--ink-muted)]">
                                            {station.operator}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {station.connectors?.map((c, idx) => {
                                                let currentLabel = "";
                                                const t = c.type.toUpperCase();
                                                if (t.includes("AC")) currentLabel = " AC";
                                                else if (t.includes("DC")) currentLabel = " DC";
                                                
                                                return (
                                                    <span key={idx} className="flex items-center gap-1 rounded-full border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-[var(--ink)]">
                                                        <Plug className="h-3 w-3 text-gray-400" />
                                                        {formatConnectionType(c.type)}{currentLabel} 
                                                        {c.powerKw ? <span className="text-orange-500 ml-1">{c.powerKw}kW</span> : null}
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 flex items-end justify-between border-t border-gray-50 pt-3">
                                            <div className="flex flex-col gap-1.5 w-[60%]">
                                                <div className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
                                                    <div className={`h-2 w-2 rounded-full ${statusColor}`} />
                                                    {isOp === true ? "Operational" : isOp === false ? "Offline" : "Unknown Status"}
                                                </div>
                                                <p className="truncate text-xs text-gray-400" title={station.address}>
                                                    {station.address}
                                                </p>
                                            </div>
                                            
                                            <button
                                                onClick={() => handleLogCharge(station)}
                                                className="flex-shrink-0 rounded-xl border border-orange-500 bg-white px-3 py-2 text-xs font-bold text-orange-500 transition-colors hover:bg-orange-50"
                                            >
                                                Log Charge Here
                                            </button>
                                        </div>
                                    </m.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                    
                    {listStations.length > visibleCount && (
                        <button 
                            onClick={() => setVisibleCount(v => v + 5)}
                            className="w-full py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-semibold text-[var(--ink)] hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Load More
                        </button>
                    )}
                </div>

                {/* RIGHT: Dynamic Map */}
                <div className="hidden lg:flex w-[60%] min-h-[400px] rounded-3xl border border-[var(--border)] bg-[#FDFBF7] shadow-sm relative overflow-hidden z-0">
                    <ErrorBoundary fallback={<div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-gray-500">Peta tidak dapat dimuat.</div>}>
                        <MapWithNoSSR userLat={userLat} userLon={userLon} stations={listStations} />
                    </ErrorBoundary>
                </div>

            </div>
        </div>
    );
}
