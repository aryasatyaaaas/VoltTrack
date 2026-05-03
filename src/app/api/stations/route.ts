import { NextResponse } from 'next/server';
import { normalizeStation } from '@/lib/normalizeStation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const distance = searchParams.get('distance') || '10';
    const maxresults = searchParams.get('maxresults') || '20';
    const search = searchParams.get('search') || '';

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    if (isNaN(Number(lat)) || isNaN(Number(lon))) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    // Cap maxresults at 50 for security/performance, unless specifically requested higher by our internal UI (we'll allow up to 10000 for the map)
    const parsedMax = Math.min(Math.max(Number(maxresults), 1), 10000);

    const apiKey = process.env.OCM_API_KEY;
    if (!apiKey) {
        console.error('OCM_API_KEY is missing in environment variables');
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    try {
        const ocmParams = new URLSearchParams({
            output: 'json',
            countrycode: 'ID',
            latitude: lat,
            longitude: lon,
            distance: distance,
            distanceunit: 'km',
            maxresults: parsedMax.toString(),
            compact: 'false',
            verbose: 'false',
            key: apiKey,
        });

        // OpenChargeMap doesn't have a native text search parameter that works well globally without slowing down.
        // We will pass the standard query and if there is a search term, we can potentially filter on the server, or let the client handle it.
        // For now, we just pass the OCM request.
        const url = `https://api.openchargemap.io/v3/poi/?${ocmParams.toString()}`;

        const res = await fetch(url, {
            // Revalidate every 5 minutes (300 seconds)
            next: { revalidate: 300 }
        });

        if (!res.ok) {
            throw new Error(`OCM API responded with status: ${res.status}`);
        }

        const data = await res.json();
        
        let filteredData = data;
        
        // Basic server-side text search if provided
        if (search) {
            const lowerSearch = search.toLowerCase();
            filteredData = data.filter((poi: any) => {
                const title = poi.AddressInfo?.Title?.toLowerCase() || '';
                const address = poi.AddressInfo?.AddressLine1?.toLowerCase() || '';
                const town = poi.AddressInfo?.Town?.toLowerCase() || '';
                const operator = poi.OperatorInfo?.Title?.toLowerCase() || '';
                return title.includes(lowerSearch) || address.includes(lowerSearch) || town.includes(lowerSearch) || operator.includes(lowerSearch);
            });
        }

        const response = NextResponse.json(filteredData.map(normalizeStation));
        // Cache-Control headers for CDN/browser
        response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        return response;

    } catch (error) {
        console.error('Error fetching from OpenChargeMap:', error);
        return NextResponse.json({ error: 'Failed to fetch station data' }, { status: 500 });
    }
}
