import { useState } from 'react';
import axios from 'axios';
import { FileSearch, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ComplianceCheck() {
  const [tenderRequirements, setTenderRequirements] = useState('');
  const [bidSummary, setBidSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheckCompliance = async (e) => {
    e.preventDefault();
    
    if (!tenderRequirements || !bidSummary) {
      toast.error('Please provide both tender requirements and bid summary');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/check-compliance`, {
        tenderRequirements,
        bidSummary
      });

      setResult(response.data);
      toast.success('Compliance analysis complete');
      
    } catch (error) {
      console.error('Error checking compliance:', error);
      toast.error(error.response?.data?.detail || 'Failed to check compliance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-indigo-600" />
            AI Compliance Checker
          </h1>
          <p className="text-slate-600">Powered by Google Gemini - Analyze bids against tender requirements</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card data-testid="tender-requirements-card" className="shadow-lg">
            <CardHeader>
              <CardTitle>Tender Requirements</CardTitle>
              <CardDescription>Enter the official tender requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                data-testid="tender-requirements-input"
                placeholder="e.g., Must include technical specifications, delivery timeline within 30 days, ISO certification, minimum 2 years experience..."
                value={tenderRequirements}
                onChange={(e) => setTenderRequirements(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                required
              />
            </CardContent>
          </Card>

          <Card data-testid="bid-summary-card" className="shadow-lg">
            <CardHeader>
              <CardTitle>Bid Summary</CardTitle>
              <CardDescription>Enter the bid details to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                data-testid="bid-summary-input"
                placeholder="e.g., We offer complete technical documentation, 45-day delivery timeline, have ISO 9001 certification..."
                value={bidSummary}
                onChange={(e) => setBidSummary(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                required
              />
            </CardContent>
          </Card>
        </div>

        <Button
          data-testid="check-compliance-button"
          onClick={handleCheckCompliance}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-6 text-lg mb-6"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing with AI...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileSearch className="w-5 h-5" />
              Check Compliance
            </span>
          )}
        </Button>

        {result && (
          <Card data-testid="compliance-result" className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.violations.length === 1 && result.violations[0] === "No violations detected" ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-green-700">Compliant</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                    <span className="text-amber-700">Violations Detected</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">AI Analysis:</h3>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                    {result.analysis}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Violations Summary:</h3>
                  <ul className="space-y-2">
                    {result.violations.map((violation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        {violation === "No violations detected" ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        )}
                        <span className="flex-1">{violation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
