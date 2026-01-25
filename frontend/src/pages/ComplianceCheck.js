import { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ComplianceCheck() {
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [bidsForTender, setBidsForTender] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [tenderRequirements, setTenderRequirements] = useState('');
  const [bidSummary, setBidSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      const response = await axios.get(`${API}/tenders`);
      setTenders(response.data);
    } catch (error) {
      console.error('Failed to fetch tenders:', error);
    }
  };

  const handleTenderSelect = async (e) => {
    const tenderId = e.target.value;
    if (!tenderId) {
      setSelectedTender(null);
      setTenderRequirements('');
      setBidsForTender([]);
      return;
    }

    const tender = tenders.find(t => t.tenderId === tenderId);
    setSelectedTender(tender);
    setTenderRequirements(tender.requirements || '');
    
    // Fetch bids for this tender
    try {
      const response = await axios.get(`${API}/bids/${tenderId}`);
      setBidsForTender(response.data);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
      setBidsForTender([]);
    }
  };

  const handleBidSelect = (e) => {
    const bidderId = e.target.value;
    if (!bidderId) {
      setSelectedBid(null);
      setBidSummary('');
      return;
    }

    const bid = bidsForTender.find(b => b.bidderId === bidderId);
    setSelectedBid(bid);
    setBidSummary(bid.bidSummary || '');
  };

  const handleCheckCompliance = async (e) => {
    e.preventDefault();
    
    if (!tenderRequirements || !bidSummary) {
      toast.error('Both tender requirements and bid summary required');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/compliance`, {
        tenderRequirements,
        bidSummary
      });

      setResult(response.data);
      toast.success('AI analysis complete');
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(error.response?.data?.detail || 'System error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="grid-background"></div>
      
      <div className="page-header">
        <h1 className="page-title">
          <Brain className="page-title-icon" size={48} />
          AI COMPLIANCE
        </h1>
        <p className="page-description">
          Powered by QuadForge
        </p>
      </div>

      {/* Tender and Bid Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ fontSize: '1.1rem' }}>SELECT TENDER</h2>
            <p className="card-description" style={{ fontSize: '0.85rem' }}>Choose tender to load requirements</p>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              data-testid="tender-select"
              value={selectedTender?.tenderId || ''}
              onChange={handleTenderSelect}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontFamily: 'JetBrains Mono',
                cursor: 'pointer',
                appearance: 'none'
              }}
            >
              <option value="">-- Select Tender --</option>
              {tenders.map((tender, index) => (
                <option key={index} value={tender.tenderId}>
                  {tender.tenderId} (${tender.budget?.toLocaleString()})
                </option>
              ))}
            </select>
            <ChevronDown size={20} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
          {selectedTender && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-green)' }}>
              ✓ Tender selected: {selectedTender.tenderId}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ fontSize: '1.1rem' }}>SELECT BID</h2>
            <p className="card-description" style={{ fontSize: '0.85rem' }}>Choose bid to load summary</p>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              data-testid="bid-select"
              value={selectedBid?.bidderId || ''}
              onChange={handleBidSelect}
              disabled={!selectedTender || bidsForTender.length === 0}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontFamily: 'JetBrains Mono',
                cursor: selectedTender && bidsForTender.length > 0 ? 'pointer' : 'not-allowed',
                opacity: selectedTender && bidsForTender.length > 0 ? 1 : 0.5,
                appearance: 'none'
              }}
            >
              <option value="">-- Select Bid --</option>
              {bidsForTender.map((bid, index) => (
                <option key={index} value={bid.bidderId}>
                  Bid {index + 1}: {bid.bidderId.substring(0, 8)}... ({new Date(bid.timestamp).toLocaleDateString()})
                </option>
              ))}
            </select>
            <ChevronDown size={20} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
          {selectedBid && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--accent-green)' }}>
              ✓ Bid selected: {selectedBid.bidderId.substring(0, 16)}...
            </div>
          )}
          {selectedTender && bidsForTender.length === 0 && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No bids submitted for this tender yet
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">TENDER REQUIREMENTS</h2>
            <p className="card-description">Official tender specifications</p>
          </div>
          <textarea
            data-testid="tender-requirements-input"
            className="textarea-field"
            placeholder="Select a tender above or enter requirements manually..."
            value={tenderRequirements}
            onChange={(e) => setTenderRequirements(e.target.value)}
            required
          />
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">BID SUMMARY</h2>
            <p className="card-description">Proposal to analyze</p>
          </div>
          <textarea
            data-testid="bid-summary-input"
            className="textarea-field"
            placeholder="Select a bid above or enter summary manually..."
            value={bidSummary}
            onChange={(e) => setBidSummary(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        data-testid="check-compliance-button"
        onClick={handleCheckCompliance}
        className="btn btn-primary btn-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="spinner" />
            AI ANALYZING...
          </>
        ) : (
          <>
            <Brain size={20} />
            RUN COMPLIANCE CHECK
          </>
        )}
      </button>

      {result && (
        <div data-testid="compliance-result" className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {result.violations.length === 1 && result.violations[0] === "No violations detected" ? (
                <>
                  <CheckCircle style={{ color: 'var(--accent-green)' }} size={32} />
                  <h2 className="card-title" style={{ color: 'var(--accent-green)' }}>COMPLIANT</h2>
                </>
              ) : (
                <>
                  <AlertTriangle style={{ color: '#ff0000' }} size={32} />
                  <h2 className="card-title" style={{ color: '#ff0000' }}>VIOLATIONS DETECTED</h2>
                </>
              )}
            </div>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI ANALYSIS</h3>
            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-primary)', fontFamily: 'JetBrains Mono', fontSize: '0.9rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
              {result.analysis}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VIOLATIONS SUMMARY</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.violations.map((violation, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                  {violation === "No violations detected" ? (
                    <CheckCircle style={{ color: 'var(--accent-green)', minWidth: '20px' }} size={20} />
                  ) : (
                    <AlertTriangle style={{ color: '#ff0000', minWidth: '20px' }} size={20} />
                  )}
                  <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{violation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
