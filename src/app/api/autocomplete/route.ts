export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 3) return Response.json([]);

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query + " Toronto")}&limit=10&lang=en&bbox=-79.6393,43.5810,-79.1152,43.8555`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Vaelo/1.0 (gabriel@vaelo.ca)" },
    });
    const data = await res.json();

    const seen = new Set<string>();
    const results = data.features
      .map((f: any) => ({
        display_name: [f.properties.name, f.properties.street, f.properties.city]
          .filter(Boolean)
          .join(", "),
        lat: String(f.geometry.coordinates[1]),
        lon: String(f.geometry.coordinates[0]),
      }))
      .filter((r: any) => {
        if (seen.has(r.display_name)) return false;
        seen.add(r.display_name);
        return true;
      })
      .slice(0, 5);

    return Response.json(results);
  } catch {
    return Response.json([]);
  }
}