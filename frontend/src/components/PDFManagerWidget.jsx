// frontend/src/components/PDFManagerWidget.jsx
import React, { useState, useEffect } from 'react';
import { Upload, Trash2, FileText } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/pdf';

const PDFManagerWidget = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Fetch PDFs on component load ---
  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        credentials: 'include', // ⚠️ CRITICAL: Sends the HttpOnly Cookie
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPdfs(data);
      } else {
        console.error('Failed to fetch PDFs:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle PDF Upload ---
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch(`${API_URL}/upload`, { // Ensure this matches your backend route
        method: 'POST',
        credentials: 'include', // ⚠️ CRITICAL: Sends the HttpOnly Cookie
        body: formData,
        // Note: Do NOT set Content-Type header manually for FormData; fetch does it automatically
      });

      if (response.ok) {
        fetchPdfs(); // Refresh list
      } else {
        console.error('File upload failed!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle PDF Deletion ---
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include', // ⚠️ CRITICAL: Sends the HttpOnly Cookie
      });

      if (response.ok) {
        fetchPdfs(); // Refresh list
      } else {
        console.error('Deletion failed!');
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }
  };

  return (
    <div className="bg-[#11141D] rounded-2xl border border-white/10 p-6 flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText size={20} className="text-[#00E0C7]"/> PDF Manager
        </h3>
      </div>

      <div className="mb-4">
        <input
          accept="application/pdf"
          style={{ display: 'none' }}
          id="pdf-upload-button"
          type="file"
          onChange={handleFileUpload}
          disabled={loading}
        />
        <label htmlFor="pdf-upload-button">
          <button
            className="w-full py-3 rounded-xl bg-[#00E0C7] text-[#0A0D17] font-bold hover:bg-[#00E0C7]/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={loading}
          >
            <Upload size={20} />
            {loading ? 'Uploading...' : 'Upload New PDF'}
          </button>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {pdfs.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-[#94A3B8] opacity-60">
            <FileText size={48} className="mb-2" />
            <p>No PDFs uploaded yet.</p>
          </div>
        )}

        {pdfs.map((pdf) => (
          <div key={pdf._id} className="flex items-center justify-between p-3 bg-[#0A0D17] border border-white/5 rounded-xl group hover:border-[#00E0C7]/30 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-[#00E0C7]/10 flex items-center justify-center text-[#00E0C7] flex-shrink-0">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-white truncate">{pdf.filename || 'Untitled PDF'}</h4>
              </div>
            </div>
            <button
              onClick={() => handleDelete(pdf._id)}
              className="text-[#94A3B8] hover:text-[#FF4D4D] transition-colors p-2"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFManagerWidget;