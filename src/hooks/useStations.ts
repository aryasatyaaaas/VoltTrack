import { useQuery } from '@tanstack/react-query';

interface StationQueryParams {
    lat: number | null;
    lon: number | null;
    distance?: number;
    maxresults?: number;
    search?: string;
}

export function useStations({ lat, lon, distance = 10, maxresults = 20, search }: StationQueryParams) {
    return useQuery({
        queryKey: ['stations', lat, lon, distance, maxresults, search],
        queryFn: async () => {
            if (!lat || !lon) throw new Error('Location required');
            const params = new URLSearchParams({
                lat: lat.toString(),
                lon: lon.toString(),
                distance: distance.toString(),
                maxresults: maxresults.toString(),
                ...(search ? { search } : {}),
            });
            const res = await fetch(`/api/stations?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch stations');
            return res.json();
        },
        enabled: !!lat && !!lon,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
