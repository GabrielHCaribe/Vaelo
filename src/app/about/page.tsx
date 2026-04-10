export default function About() {
  return (
    <main className="min-h-screen bg-white px-8 py-16">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-sm text-indigo-500 hover:underline mb-8 block">← Back to Vaelo</a>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">About Vaelo</h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <p className="text-lg text-gray-700">Vaelo is a free price comparison tool built for Ontario drivers and travellers. We help you find the best deal on parking and bus tickets — without having to check multiple websites.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Why we built this</h2>
          <p>Finding affordable parking in Toronto or comparing bus ticket prices across providers is surprisingly difficult. Prices vary significantly depending on where you look, and most people end up overpaying simply because they don't have time to check every option. Vaelo solves that.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">What we do</h2>
          <p>Vaelo aggregates publicly available pricing data from parking operators and bus providers across Ontario. We display results in a clean, easy-to-understand format so you can make the best decision quickly.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">What we don't do</h2>
          <p>We don't sell your data. We don't require an account. We don't show ads. Vaelo is a tool, not a platform — it exists to save you money and time, nothing else.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Who we are</h2>
          <p>Vaelo was founded by Gabriel Caribe, an Engineering Science student at the University of Toronto. It started as a side project to solve a real problem, and grew from there.</p>

          <h2 className="text-xl font-bold text-gray-900 mt-8">Get in touch</h2>
          <p>Have feedback, a partnership idea, or just want to say hi? Reach us at <a href="mailto:gabriel@vaelo.ca" className="text-indigo-500 hover:underline">gabriel@vaelo.ca</a>.</p>
        </div>
      </div>
    </main>
  );
}