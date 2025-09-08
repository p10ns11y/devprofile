export default function CVIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Peramanathan Sathyamoorthy
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Senior Software Engineer
          </p>
          <p className="text-gray-700 leading-relaxed">
            Full-stack developer with 9+ years of experience in building scalable web applications,
            leading development teams, and delivering innovative technology solutions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a
            href="/cv.pdf"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            👁️ View CV
          </a>

          <a
            href="/cv.pdf"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            download="peramanathan-sathyamoorthy-cv.pdf"
          >
            ⬇️ Download CV
          </a>
        </div>

        <div className="text-sm text-gray-500">
          <p>Built with Next.js 15 & React 19</p>
        </div>
      </div>
    </div>
  );
}