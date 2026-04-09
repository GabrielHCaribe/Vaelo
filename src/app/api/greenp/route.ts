export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "0");
  const lng = parseFloat(searchParams.get("lng") ?? "0");
  const duration = parseFloat(searchParams.get("duration") ?? "1");

  const res = await fetch(
    "https://ckan0.cf.opendata.inter.prod-toronto.ca/dataset/b66466c3-69c8-4825-9c8b-04b270069193/resource/8549d588-30b0-482e-b872-b21beefdda22/download/green-p-parking-2019.json",
    { next: { revalidate: 86400 } } // cache for 24 hours
  );
  const data = await res.json();
  const lots = data.carparks;

  // Calculate distance in km using Haversine formula
  function distance(lat2: number, lng2: number) {
    const R = 6371;
    const dLat = ((lat2 - lat) * Math.PI) / 180;
    const dLng = ((lng2 - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const nearby = lots
    .filter((lot: any) => !lot.is_under_construction)
    .map((lot: any) => ({
      id: lot.id,
      address: lot.address,
      lat: parseFloat(lot.lat),
      lng: parseFloat(lot.lng),
      ratePerHalfHour: parseFloat(lot.rate_half_hour) || 0,
      estimatedCost: parseFloat(lot.rate_half_hour) * duration * 2,
      type: lot.carpark_type_str,
      capacity: lot.capacity,
      slug: lot.slug,
      distanceKm: distance(parseFloat(lot.lat), parseFloat(lot.lng)),
    }))
    .filter((lot: any) => lot.distanceKm < 1) // within 1km
    .sort((a: any, b: any) => a.estimatedCost - b.estimatedCost)
    .slice(0, 10);

  return Response.json({ lots: nearby, duration });
}