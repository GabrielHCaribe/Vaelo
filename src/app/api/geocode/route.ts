export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) return Response.json({ error: "No address provided" }, { status: 400 });

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", Toronto, Ontario")}&format=json&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Vaelo/1.0 (gabriel@vaelo.ca)" },
    });
    const data = await res.json();

    if (!data.length) return Response.json({ error: "Address not found" }, { status: 404 });

    return Response.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}