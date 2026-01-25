import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Lock, Brain, Database, Home, Shield, Plus } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import UploadBid from "@/pages/UploadBid";
import ComplianceCheck from "@/pages/ComplianceCheck";
import AuditLog from "@/pages/AuditLog";
import CreateTender from "@/pages/CreateTender";

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'HOME' },
    { path: '/create', icon: Plus, label: 'CREATE' },
    { path: '/upload', icon: Lock, label: 'SEAL' },
    { path: '/check', icon: Brain, label: 'COMPLIANCE' },
    { path: '/audit', icon: Database, label: 'AUDIT' }
  ];

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          <Shield className="nav-logo-icon" size={32} />
          AI TENDER GUARDIAN
        </Link>
        <div className="nav-links">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                data-testid={`nav-${label.toLowerCase()}`}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="page-container">
      <div className="grid-background"></div>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Shield size={80} style={{ color: 'var(--accent-green)', filter: 'drop-shadow(0 0 20px var(--accent-green))' }} />
        </div>
        <h1 style={{ fontSize: '4rem', fontWeight: '700', marginBottom: '1rem', fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
          AI TENDER GUARDIAN
        </h1>
        <p style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Autonomous Procurement System
        </p>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
          Military-grade encryption • AI compliance detection • Immutable audit trail • Zero external dependencies
        </p>
      </div>

      <div className="home-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <Link to="/create" data-testid="home-create-card" className="home-card">
          <Plus className="home-card-icon" size={48} />
          <h3 className="home-card-title">CREATE TENDER</h3>
          <p className="home-card-description">
            Define requirements and compliance criteria for procurement process.
          </p>
        </Link>

        <Link to="/upload" data-testid="home-upload-card" className="home-card">
          <Lock className="home-card-icon" size={48} />
          <h3 className="home-card-title">BID ENCRYPTION</h3>
          <p className="home-card-description">
            AES-256 encryption with SHA-3-512 hashing. Automatic notifications sent on seal.
          </p>
        </Link>

        <Link to="/check" data-testid="home-compliance-card" className="home-card">
          <Brain className="home-card-icon" size={48} />
          <h3 className="home-card-title">AI COMPLIANCE</h3>
          <p className="home-card-description">
            Google Gemini 3 Flash real-time analysis. Sub-second violation detection.
          </p>
        </Link>

        <Link to="/audit" data-testid="home-audit-card" className="home-card">
          <Database className="home-card-icon" size={48} />
          <h3 className="home-card-title">AUDIT LOG</h3>
          <p className="home-card-description">
            Cryptographic proof of all transactions. Tamper-proof transparency.
          </p>
        </Link>
      </div>

      <div className="card" style={{ marginTop: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Shield style={{ color: 'var(--accent-green)' }} size={32} />
          <h2 className="card-title">COMPLETE WORKFLOW</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. CREATE</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Tender creator defines requirements and compliance criteria</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. SEAL</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Bidders submit encrypted bids with summary for compliance</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>3. VERIFY</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>AI automatically checks compliance against tender requirements</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>4. AUDIT</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>Complete immutable record with cryptographic proof</p>
          </div>
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
        <Toaster position="top-right" theme="dark" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateTender />} />
          <Route path="/upload" element={<UploadBid />} />
          <Route path="/check" element={<ComplianceCheck />} />
          <Route path="/audit" element={<AuditLog />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
