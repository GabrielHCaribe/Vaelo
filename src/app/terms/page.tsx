export default function Terms() {
  return (
    <main className="min-h-screen bg-white px-8 py-16">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-sm text-indigo-500 hover:underline mb-8 block">← Back to Vaelo</a>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Terms of Use</h1>

        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p>By using Vaelo, you agree to the following terms. Please read them carefully.</p>

          <h2 className="text-xl font-bold text-gray-900">1. Use of the service</h2>
          <p>Vaelo is a free price comparison tool. You may use it for personal, non-commercial purposes. You may not use Vaelo to scrape, copy, or redistribute its data, or use it in any way that violates applicable laws.</p>

          <h2 className="text-xl font-bold text-gray-900">2. Accuracy of information</h2>
          <p>Vaelo aggregates pricing and availability data from third-party sources. While we make every effort to display accurate information, we cannot guarantee that prices, hours, or availability shown are current or correct. Always verify information directly with the provider before making a purchase or travel decision.</p>

          <h2 className="text-xl font-bold text-gray-900">3. Third-party links</h2>
          <p>Vaelo contains links to third-party websites and services (e.g. Green P, Flixbus, Google Maps). We are not responsible for the content, accuracy, or practices of these third parties. Clicking through to a third-party site is at your own discretion.</p>

          <h2 className="text-xl font-bold text-gray-900">4. Limitation of liability</h2>
          <p>Vaelo is provided "as is" without any warranties. We are not liable for any losses, damages, or inconveniences arising from your use of the service or reliance on information displayed on Vaelo.</p>

          <h2 className="text-xl font-bold text-gray-900">5. Changes to these terms</h2>
          <p>We may update these terms from time to time. Continued use of Vaelo after changes are posted constitutes acceptance of the new terms.</p>

          <h2 className="text-xl font-bold text-gray-900">6. Contact</h2>
          <p>Questions about these terms? Contact us at <a href="mailto:gabriel@vaelo.ca" className="text-indigo-500 hover:underline">gabriel@vaelo.ca</a>.</p>
        </div>
      </div>
    </main>
  );
}