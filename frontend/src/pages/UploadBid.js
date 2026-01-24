import { useState } from 'react';
import axios from 'axios';
import { Upload, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UploadBid() {
  const [file, setFile] = useState(null);
  const [tenderId, setTenderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`File selected: ${selectedFile.name}`);
    }
  };

  const handleSealBid = async (e) => {
    e.preventDefault();
    
    if (!file || !tenderId) {
      toast.error('Please provide both file and tender ID');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tender_id', tenderId);

      const response = await axios.post(`${API}/seal-bid`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data);
      toast.success('Bid sealed successfully!');
      
      // Reset form
      setFile(null);
      setTenderId('');
      document.getElementById('file-input').value = '';
      
    } catch (error) {
      console.error('Error sealing bid:', error);
      toast.error(error.response?.data?.detail || 'Failed to seal bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Lock className="w-10 h-10 text-emerald-600" />
            Bid Sealing Engine
          </h1>
          <p className="text-slate-600">Encrypt and seal your bid with AES-256 and SHA-3-512 hashing</p>
        </div>

        <Card data-testid="seal-bid-card" className="shadow-lg">
          <CardHeader>
            <CardTitle>Upload Bid Document</CardTitle>
            <CardDescription>Your bid will be encrypted and an immutable hash will be generated</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSealBid} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tender ID
                </label>
                <Input
                  data-testid="tender-id-input"
                  type="text"
                  placeholder="e.g., TENDER-2025-001"
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bid Document
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-emerald-500 transition-colors">
                  <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <input
                    id="file-input"
                    data-testid="file-input"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    <span className="text-emerald-600 font-medium hover:text-emerald-700">
                      Choose a file
                    </span>
                    <span className="text-slate-500"> or drag and drop</span>
                  </label>
                  {file && (
                    <p className="mt-2 text-sm text-slate-600">
                      Selected: <strong>{file.name}</strong>
                    </p>
                  )}
                </div>
              </div>

              <Button
                data-testid="seal-bid-button"
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-6 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sealing Bid...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Seal Bid
                  </span>
                )}
              </Button>
            </form>

            {result && (
              <div data-testid="seal-result" className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-emerald-900 mb-2">{result.message}</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">Bidder ID:</span>
                        <p className="font-mono text-xs bg-white p-2 rounded mt-1 break-all">{result.bidderId}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Bid Hash (SHA-3-512):</span>
                        <p className="font-mono text-xs bg-white p-2 rounded mt-1 break-all">{result.bidHash}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
