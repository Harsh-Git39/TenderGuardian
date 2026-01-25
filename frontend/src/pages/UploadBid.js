import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Lock, CheckCircle, Shield, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UploadBid() {
  const [file, setFile] = useState(null);
  const [tenderId, setTenderId] = useState('');
  const [bidSummary, setBidSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTenders, setActiveTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);

  useEffect(() => {
    fetchActiveTenders();
  }, []);

  const fetchActiveTenders = async () => {
    try {
      const response = await axios.get(`${API}/tenders`);
      setActiveTenders(response.data);
    } catch (error) {
      console.error('Failed to fetch tenders:', error);
    }
  };

  const handleTenderSelect = (tender) => {
    setSelectedTender(tender);
    setTenderId(tender.tenderId);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`File locked: ${selectedFile.name}`);
    }
  };

  const handleSealBid = async (e) => {
    e.preventDefault();
    
    if (!file || !tenderId || !bidSummary) {
      toast.error('All fields required: file, tender ID, and bid summary');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tender_id', tenderId);
      formData.append('bid_summary', bidSummary);

      const response = await axios.post(`${API}/seal`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data);
      toast.success('Bid encrypted and sealed');
      
      setFile(null);
      setTenderId('');
      setBidSummary('');
      setSelectedTender(null);
      document.getElementById('file-input').value = '';
      
    } catch (error) {
      console.error('Sealing failed:', error);
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
          <Shield className="page-title-icon" size={48} />
          BID ENCRYPTION
        </h1>
        <p className="page-description">
          Powered by QuadForge
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">SEAL YOUR BID</h2>
            <p className="card-description">Upload document + provide summary for cryptographic sealing</p>
          </div>
          
          <form onSubmit={handleSealBid}>
            <div className="input-group">
              <label className="input-label">TENDER ID</label>
              <input
                data-testid="tender-id-input"
                type="text"
                className="input-field"
                placeholder="Select from list or enter manually"
                value={tenderId}
                onChange={(e) => setTenderId(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">BID DOCUMENT</label>
              <div className="upload-zone">
                <Upload className="upload-icon" size={48} />
                <input
                  id="file-input"
                  data-testid="file-input"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  required
                />
                <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                  <span className="upload-text">
                    <span className="upload-text-highlight">CLICK TO SELECT</span>
                    {' '}or drag and drop
                  </span>
                </label>
                {file && (
                  <p style={{ marginTop: '1rem', color: 'var(--accent-green)' }}>
                    ✓ {file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                <FileText size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                BID SUMMARY (For Compliance Check)
              </label>
              <textarea
                data-testid="bid-summary-input"
                className="textarea-field"
                placeholder="Example: We offer FDA certified equipment (K234567), ISO 13485 compliant, 3-year warranty, 45-day delivery. Total bid: $4,600,000."
                value={bidSummary}
                onChange={(e) => setBidSummary(e.target.value)}
                style={{ minHeight: '120px' }}
                required
              />
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                This summary will be used for automated compliance verification against tender requirements.
              </div>
            </div>

            <button
              data-testid="seal-bid-button"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  ENCRYPTING...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  SEAL BID
                </>
              )}
            </button>
          </form>

          {result && (
            <div data-testid="seal-result" className="result-box result-success">
              <div className="result-header">
                <CheckCircle className="result-icon" size={24} />
                <h3 className="result-title">ENCRYPTION COMPLETE</h3>
              </div>
              <div className="result-content">
                <div className="result-item">
                  <span className="result-label">BIDDER ID</span>
                  <div className="result-value">{result.bidderId}</div>
                </div>
                <div className="result-item">
                  <span className="result-label">CRYPTOGRAPHIC HASH (SHA-3-512)</span>
                  <div className="result-value">{result.bidHash}</div>
                </div>
                <div className="result-item">
                  <span className="result-label">STATUS</span>
                  <div className="result-value">
                    {result.automated ? '✓ AUTO-NOTIFICATION SENT' : 'SEALED'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Tenders Sidebar */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title" style={{ fontSize: '1.25rem' }}>ACTIVE TENDERS</h2>
            <p className="card-description" style={{ fontSize: '0.85rem' }}>Click to view requirements</p>
          </div>
          
          {activeTenders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <FileText size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.9rem' }}>No active tenders</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeTenders.map((tender, index) => (
                <div 
                  key={index}
                  data-testid={`tender-card-${index}`}
                  onClick={() => handleTenderSelect(tender)}
                  style={{
                    background: selectedTender?.tenderId === tender.tenderId ? 'var(--accent-green-dim)' : 'var(--bg-secondary)',
                    border: selectedTender?.tenderId === tender.tenderId ? '1px solid var(--accent-green)' : '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: '600', 
                    color: selectedTender?.tenderId === tender.tenderId ? 'var(--accent-green)' : 'var(--text-primary)',
                    marginBottom: '0.25rem',
                    fontFamily: 'JetBrains Mono'
                  }}>
                    {tender.tenderId}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ${tender.budget?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTender && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--accent-green)', borderRadius: '8px' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requirements:</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {selectedTender.requirements}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
