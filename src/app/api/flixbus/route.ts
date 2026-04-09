export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  const cityIds: Record<string, string> = {
    "toronto":   "41d79c93-0374-47f3-8f3a-bd154f55153a",
    "london":    "347f9e9d-0c48-4770-90f6-cc6a18802bfa",
    "ottawa":    "b8027c62-7ade-4dc0-a96f-ae3ef99c9de5",
    "hamilton":  "cf3d4161-7afb-43aa-bb11-160b9fbdebed",
    "kitchener": "ef72022c-7325-4c6f-981b-953232e59fe7",
  };

  const fromId = cityIds[from?.toLowerCase() ?? ""];
  const toId = cityIds[to?.toLowerCase() ?? ""];

  if (!fromId || !toId) {
    return Response.json({ error: "City not supported yet" }, { status: 400 });
  }

   const [year, month, day] = date!.split("-");
   const formattedDate = `${day}.${month}.${year}`;

   const url = `https://global.api.flixbus.com/search/service/v4/search?from_city_id=${fromId}&to_city_id=${toId}&departure_date=${formattedDate}&products=%7B%22adult%22%3A1%7D&currency=CAD&locale=en_CA&search_by=cities&include_after_midnight_rides=1`;

   try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ error: "Failed to fetch" }, { status: 500 });
  }
}