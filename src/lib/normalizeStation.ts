export interface NormalizedStation {
    id: number;
    name: string;
    address: string;
    lat: number;
    lon: number;
    distanceKm: number;
    operator: string;
    isOperational: boolean | null;
    connectors: Array<{
        type: string;
        powerKw: number | null;
        quantity: number;
    }>;
}

export function normalizeStation(poi: any): NormalizedStation {
    return {
        id: poi.ID,
        name: poi.AddressInfo?.Title ?? 'Unknown Station',
        address: [
            poi.AddressInfo?.AddressLine1,
            poi.AddressInfo?.Town
        ].filter(Boolean).join(', '),
        lat: poi.AddressInfo?.Latitude,
        lon: poi.AddressInfo?.Longitude,
        distanceKm: Math.round((poi.AddressInfo?.Distance ?? 0) * 10) / 10,
        operator: poi.OperatorInfo?.Title ?? 'Unknown',
        isOperational: poi.StatusType?.IsOperational ?? null,
        connectors: (poi.Connections ?? []).map((c: any) => ({
            type: c.ConnectionType?.Title ?? 'Unknown',
            powerKw: c.PowerKW ?? null,
            quantity: c.Quantity ?? 1,
        })),
    };
}
