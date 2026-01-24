import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Lock, FileSearch, Shield, Home } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import UploadBid from "@/pages/UploadBid";
import ComplianceCheck from "@/pages/ComplianceCheck";
import AuditLog from "@/pages/AuditLog";

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upload', icon: Lock, label: 'Seal Bid' },
    { path: '/check', icon: FileSearch, label: 'Compliance' },
    { path: '/audit', icon: Shield, label: 'Audit Log' }
  ];

  return (
    <nav className="bg-white shadow-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-600" />
            <span className="font-bold text-xl text-slate-900">AI Tender Guardian</span>
          </div>
          <div className="flex gap-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-8">
      <div className="max-w-4xl text-center">
        <div className="mb-8">
          <Shield className="w-24 h-24 mx-auto text-emerald-600 mb-4" />
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            AI Tender Guardian
          </h1>
          <p className="text-xl text-slate-600">
            Sealed-bid anchoring with AI compliance checking and immutable audit logs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Link to="/upload" data-testid="home-upload-card">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-emerald-500">
              <Lock className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
              <h3 className="font-bold text-lg text-slate-900 mb-2">Bid Sealing</h3>
              <p className="text-sm text-slate-600">AES-256 encryption with SHA-3-512 hashing</p>
            </div>
          </Link>

          <Link to="/check" data-testid="home-compliance-card">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-500">
              <FileSearch className="w-12 h-12 mx-auto text-indigo-600 mb-3" />
              <h3 className="font-bold text-lg text-slate-900 mb-2">AI Compliance</h3>
              <p className="text-sm text-slate-600">Powered by Google Gemini</p>
            </div>
          </Link>

          <Link to="/audit" data-testid="home-audit-card">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-violet-500">
              <Shield className="w-12 h-12 mx-auto text-violet-600 mb-3" />
              <h3 className="font-bold text-lg text-slate-900 mb-2">Audit Log</h3>
              <p className="text-sm text-slate-600">Immutable transparency</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="font-bold text-lg text-slate-900 mb-4">n8n Governance Webhook</h3>
          <p className="text-sm text-slate-600 mb-2">Endpoint for tender updates:</p>
          <code className="block bg-slate-100 p-3 rounded text-sm font-mono text-left">
            POST {process.env.REACT_APP_BACKEND_URL}/api/tender-update
          </code>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadBid />} />
          <Route path="/check" element={<ComplianceCheck />} />
          <Route path="/audit" element={<AuditLog />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
