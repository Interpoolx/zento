import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Editor } from '@/components/editor/Editor';
import { Button, Card } from '@/components/ui';
import { Layout, Zap, ArrowRight, Palette, Globe, Github, Twitter, ExternalLink } from 'lucide-react';

function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Zento</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost">Sign In</Button>
            <a href="/profile">
              <Button>Get Started Free</Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Build beautiful profile pages in minutes
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your personal page,
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                beautifully simple
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create stunning profile pages with drag-and-drop simplicity. 
              No coding required. Share your links, showcase your work, 
              and connect with your audience.
            </p>
            <div className="flex items-center justify-center gap-4">
               <a href="/profile">
                 <Button size="lg">
                   Create Your Page
                   <ArrowRight className="w-5 h-5 ml-2" />
                 </Button>
               </a>
               <Button variant="secondary" size="lg">
                 View Examples
               </Button>
             </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to stand out</h2>
              <p className="text-lg text-gray-600">Powerful features that make building your page effortless</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card variant="elevated" className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Layout className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Drag & Drop Builder</h3>
                <p className="text-gray-600">
                  Intuitive grid-based layout system. Simply drag widgets to arrange them exactly how you want.
                </p>
              </Card>

              <Card variant="elevated" className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Beautiful Themes</h3>
                <p className="text-gray-600">
                  Choose from stunning themes or customize every detail to match your personal brand perfectly.
                </p>
              </Card>

              <Card variant="elevated" className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Widgets</h3>
                <p className="text-gray-600">
                  Connect your social profiles, showcase your work, and embed videos with smart widgets.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-3xl p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to create your page?</h2>
              <p className="text-lg text-white/80 mb-8">
                Join thousands of creators who trust Zento for their personal pages.
              </p>
              <a href="/profile">
                <Button 
                  size="lg" 
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Zento</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/profile" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
