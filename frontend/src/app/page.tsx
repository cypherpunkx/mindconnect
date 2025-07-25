import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MindConnect - Beranda',
  description: 'Selamat datang di MindConnect - Platform kesehatan mental dan edukasi untuk remaja',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Selamat Datang di{' '}
            <span className="text-blue-600">MindConnect</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform web interaktif yang menyediakan dukungan kesehatan mental, 
            edukasi finansial, dan manajemen penggunaan teknologi untuk generasi muda.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Zona Kesehatan Mental
              </h3>
              <p className="text-gray-600 text-sm">
                Self-assessment, jurnal emosi, mindfulness, dan komunitas dukungan
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Edukasi Finansial
              </h3>
              <p className="text-gray-600 text-sm">
                Simulasi keuangan, microlearning, dan kalkulator finansial
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Manajemen Teknologi
              </h3>
              <p className="text-gray-600 text-sm">
                Screen time tracking, digital detox, dan literasi digital
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Akses & Inklusi
              </h3>
              <p className="text-gray-600 text-sm">
                Peta layanan, info beasiswa, dan fitur aksesibilitas
              </p>
            </div>
          </div>
          
          <div className="mt-12">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Mulai Sekarang
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}