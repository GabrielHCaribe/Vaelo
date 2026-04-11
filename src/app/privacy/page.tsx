export default function Privacy() {
  return (
    <main className="min-h-screen bg-white px-8 py-16">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-sm text-indigo-500 hover:underline mb-8 block">← Back to Vaelo</a>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>At Vaelo, your privacy is important to us. This policy explains what information we collect, how we use it, and what we don't do with it.</p>

          <h2 className="text-xl font-bold text-gray-900">Information we collect</h2>
          <p>Vaelo does not require you to create an account or provide any personal information to use the service. When you search for parking, we use your device's location (with your permission) to find nearby lots. This location data is used only to perform your search and is never stored or shared.</p>

          <h2 className="text-xl font-bold text-gray-900">Cookies and analytics</h2>
          <p>"Vaelo uses Google Analytics to collect anonymous usage data to understand how visitors use our site. You can opt out at tools.google.com/dlpage/gaoptout."</p>

          <h2 className="text-xl font-bold text-gray-900">Third-party services</h2>
          <p>Vaelo displays data from third-party providers including Green P (Toronto Parking Authority), Flixbus, and Megabus. When you click through to book with these providers, you are subject to their own privacy policies.</p>
          <p>We use OpenStreetMap and related services to display maps and geocode addresses. These services are subject to their own terms of use.</p>

          <h2 className="text-xl font-bold text-gray-900">What we don't do</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We do not sell your data to anyone.</li>
            <li>We do not show targeted advertising.</li>
            <li>We do not store your search history.</li>
            <li>We do not share your location with third parties.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900">Contact</h2>
          <p>If you have any questions about this policy, contact us at <a href="mailto:gabriel@vaelo.ca" className="text-indigo-500 hover:underline">gabriel@vaelo.ca</a>.</p>
        </div>
      </div>
    </main>
  );
}