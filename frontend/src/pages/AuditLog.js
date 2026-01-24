import { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Clock, Hash, User, FileCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AuditLog() {
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/audit-log`);
      setAuditLog(response.data);
    } catch (error) {
      console.error('Error fetching audit log:', error);
      toast.error('Failed to fetch audit log');
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
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-violet-600" />
            Immutable Audit Log
          </h1>
          <p className="text-slate-600">Complete history of all sealed bids - tamper-proof and transparent</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : auditLog.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="py-20 text-center">
              <FileCheck className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No sealed bids yet</p>
              <p className="text-slate-400 text-sm mt-2">Upload your first bid to see it in the audit log</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div data-testid="audit-log-count" className="text-sm text-slate-600 mb-4">
              Total Entries: <strong>{auditLog.length}</strong>
            </div>
            {auditLog.map((entry, index) => (
              <Card key={index} data-testid={`audit-entry-${index}`} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Hash className="w-5 h-5 text-violet-600" />
                        {entry.tenderId}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(entry.timestamp)}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={entry.status === 'SEALED' ? 'default' : 'secondary'}
                      className="bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      {entry.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-slate-500 mt-1" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 mb-1">Bidder ID</div>
                        <div className="font-mono text-xs bg-slate-50 p-2 rounded break-all">
                          {entry.bidderId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Hash className="w-4 h-4 text-slate-500 mt-1" />
                      <div className="flex-1">
                        <div className="text-xs text-slate-500 mb-1">Bid Hash (SHA-3-512)</div>
                        <div className="font-mono text-xs bg-slate-50 p-2 rounded break-all">
                          {entry.bidHash}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
