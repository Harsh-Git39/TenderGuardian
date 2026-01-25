import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Clock, Hash, User, Activity, FileText } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuditLog() {
  const [auditLog, setAuditLog] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedBid, setExpandedBid] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [auditRes, statsRes] = await Promise.all([
        axios.get(`${API}/audit`),
        axios.get(`${API}/stats`)
      ]);
      setAuditLog(auditRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load audit log');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="page-container">
      <div className="grid-background"></div>
      
      <div className="page-header">
        <h1 className="page-title">
          <Database className="page-title-icon" size={48} />
          AUDIT LOG
        </h1>
        <p className="page-description">
          Powered by QuadForge
        </p>
      </div>

      {stats && (
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-value">{stats.total_bids}</div>
            <div className="stat-label">Total Bids</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_tenders}</div>
            <div className="stat-label">Total Tenders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.last_24h_bids}</div>
            <div className="stat-label">Last 24h Bids</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.automation_events}</div>
            <div className="stat-label">Automation Events</div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', borderWidth: '4px', borderColor: 'var(--accent-green)', borderTopColor: 'transparent' }} />
        </div>
      ) : auditLog.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem' }}>
          <Activity size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1.5rem' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>NO SEALED BIDS YET</h3>
          <p style={{ color: 'var(--text-muted)' }}>Upload your first bid to see it in the audit log</p>
        </div>
      ) : (
        <div>
          <div data-testid="audit-log-count" style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            TOTAL ENTRIES: <strong style={{ color: 'var(--accent-green)' }}>{auditLog.length}</strong>
          </div>
          
          {auditLog.map((entry, index) => (
            <div key={index} data-testid={`audit-entry-${index}`} className="audit-entry">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Hash size={20} style={{ color: 'var(--accent-green)' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', fontFamily: 'JetBrains Mono' }}>{entry.tenderId}</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <Clock size={16} />
                    {formatDate(entry.timestamp)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="audit-badge">{entry.status}</div>
                  {entry.bidSummary && (
                    <button
                      onClick={() => setExpandedBid(expandedBid === index ? null : index)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '6px',
                        color: 'var(--accent-green)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {expandedBid === index ? 'HIDE SUMMARY' : 'VIEW SUMMARY'}
                    </button>
                  )}
                </div>
              </div>

              {expandedBid === index && entry.bidSummary && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <FileText size={16} style={{ color: 'var(--accent-green)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BID SUMMARY</span>
                  </div>
                  <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                    {entry.bidSummary}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <User size={16} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BIDDER ID</span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', wordBreak: 'break-all', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>
                    {entry.bidderId}
                  </div>
                </div>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Hash size={16} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CRYPTOGRAPHIC HASH (SHA-3-512)</span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '6px', wordBreak: 'break-all', color: 'var(--accent-green)', border: '1px solid var(--border-primary)' }}>
                    {entry.bidHash}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
