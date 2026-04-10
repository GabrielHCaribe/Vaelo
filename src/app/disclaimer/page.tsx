export default function Disclaimer() {
  return (
    <main className="min-h-screen bg-white px-8 py-16">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-sm text-indigo-500 hover:underline mb-8 block">← Back to Vaelo</a>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Disclaimer</h1>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <h2 className="text-xl font-bold text-gray-900">Pricing accuracy</h2>
          <p>The parking rates and bus ticket prices displayed on Vaelo are sourced from publicly available data and third-party providers. These prices are provided for informational and comparison purposes only. Actual prices may differ due to promotions, dynamic pricing, time of day, demand, or updates by the provider that have not yet been reflected on Vaelo.</p>
          <p>Vaelo strongly recommends confirming the final price directly with the parking operator or bus provider before completing any transaction.</p>

          <h2 className="text-xl font-bold text-gray-900">Parking data</h2>
          <p>Green P parking data is sourced from the City of Toronto Open Data portal. While we use the most recent available dataset, rates and lot availability may have changed. Posted signage at each lot always takes precedence over information displayed on Vaelo.</p>

          <h2 className="text-xl font-bold text-gray-900">Bus data</h2>
          <p>Bus schedule and pricing data is sourced directly from provider APIs and may not reflect last-minute changes, cancellations, or promotions. Always confirm your booking directly with the bus operator.</p>

          <h2 className="text-xl font-bold text-gray-900">No endorsement</h2>
          <p>The appearance of any provider on Vaelo does not constitute an endorsement of that provider. Vaelo is an independent comparison tool and is not affiliated with Green P, Flixbus, Megabus, SpotHero, or any other provider displayed on the platform.</p>

          <h2 className="text-xl font-bold text-gray-900">Maps and directions</h2>
          <p>Map data is provided by OpenStreetMap contributors. Directions are provided via Google Maps and Apple Maps. Vaelo is not responsible for the accuracy of map data or navigation instructions.</p>

          <h2 className="text-xl font-bold text-gray-900">Contact</h2>
          <p>If you notice inaccurate information on Vaelo, please let us know at <a href="mailto:gabriel@vaelo.ca" className="text-indigo-500 hover:underline">gabriel@vaelo.ca</a> and we'll address it promptly.</p>
        </div>
      </div>
    </main>
  );
}