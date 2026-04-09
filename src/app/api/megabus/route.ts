export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  const cityIds: Record<string, string> = {
    "toronto": "145",
    "london":  "571",
  };

  const fromId = cityIds[from?.toLowerCase() ?? ""];
  const toId = cityIds[to?.toLowerCase() ?? ""];

  if (!fromId || !toId) {
    return Response.json({ error: "City not supported yet" }, { status: 400 });
  }

  const url = `https://ca.megabus.com/journey-planner/journeys?days=1&concessionCount=0&departureDate=${date}&destinationId=${toId}&nusCount=0&originId=${fromId}&otherDisabilityCount=0&pcaCount=0&totalPassengers=1&wheelchairSeated=0`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}