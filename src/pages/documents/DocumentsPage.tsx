import React, { useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, UploadCloud, FileText, Trash2, CheckCircle2, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  parties: string;
  uploadedAt: string;
  status: 'Draft' | 'In Review' | 'Signed' | 'Rejected';
  pages: number;
}

const statusVariants: Record<DocumentItem['status'], 'gray' | 'accent' | 'success' | 'error'> = {
  Draft: 'gray',
  'In Review': 'accent',
  Signed: 'success',
  Rejected: 'error',
};

const initialDocuments: DocumentItem[] = [
  { id: 'doc-001', name: 'Investment Term Sheet', type: 'PDF', size: '1.2 MB', parties: 'Avery, Jordan', uploadedAt: 'Jun 2, 2026', status: 'Draft', pages: 8 },
  { id: 'doc-002', name: 'NDA Agreement', type: 'DOCX', size: '860 KB', parties: 'Morgan, Team', uploadedAt: 'Jun 3, 2026', status: 'In Review', pages: 6 },
  { id: 'doc-003', name: 'Founder Equity Plan', type: 'PDF', size: '2.1 MB', parties: 'Avery, Legal', uploadedAt: 'Jun 5, 2026', status: 'Signed', pages: 10 },
];

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | DocumentItem['status']>('All');
  const [showPreview, setShowPreview] = useState(false);
  const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTab, setSignatureTab] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [legalChecked, setLegalChecked] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const drawRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = search === '' ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.parties.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' || doc.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [documents, search, filterStatus]);

  const stats = useMemo(() => ({
    total: documents.length,
    draft: documents.filter(doc => doc.status === 'Draft').length,
    review: documents.filter(doc => doc.status === 'In Review').length,
    signed: documents.filter(doc => doc.status === 'Signed').length,
    rejected: documents.filter(doc => doc.status === 'Rejected').length,
  }), [documents]);

  const handleFileUpload = (file: File) => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: file.type.split('/')[1].toUpperCase() || 'FILE',
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      parties: 'Avery, Morgan',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Draft',
      pages: Math.max(2, Math.min(12, Math.ceil(file.size / 150000))),
    };
    setDocuments(prev => [newDoc, ...prev]);
    toast.success('Document uploaded successfully');
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === 'dragenter' || event.type === 'dragover');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const files = Array.from(event.dataTransfer.files);
    files.forEach(handleFileUpload);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasDataUrl('');
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawRef.current = true;
    lastPointRef.current = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
  };

  const stopDrawing = () => {
    drawRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setCanvasDataUrl(canvas.toDataURL('image/png'));
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawRef.current || !lastPointRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const newPoint = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(newPoint.x, newPoint.y);
    ctx.stroke();
    lastPointRef.current = newPoint;
    setCanvasDataUrl(canvas.toDataURL('image/png'));
  };

  const openSignatureModal = (doc: DocumentItem) => {
    setActiveDocument(doc);
    setTypedSignature('');
    setLegalChecked(false);
    setCanvasDataUrl('');
    setShowSignatureModal(true);
  };

  const applySignature = () => {
    if (!legalChecked) {
      toast.error('You must agree to the legal terms before signing');
      return;
    }
    if (signatureTab === 'draw' && !canvasDataUrl) {
      toast.error('Draw your signature before applying');
      return;
    }
    if (signatureTab === 'type' && !typedSignature.trim()) {
      toast.error('Enter your signature text');
      return;
    }
    if (!activeDocument) return;
    setDocuments(prev => prev.map(doc => doc.id === activeDocument.id ? { ...doc, status: 'Signed' } : doc));
    toast.success('Document signed and marked as Signed');
    setShowSignatureModal(false);
  };

  const openPreview = (doc: DocumentItem) => {
    setActiveDocument(doc);
    setPreviewPage(1);
    setZoomLevel(1);
    setShowPreview(true);
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
    toast.success('Document deleted');
  };

  const signLabel = `${signatureTab === 'draw' ? 'Drawn' : 'Typed'} signature ready`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Upload, preview, sign, and manage your documents from one page.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-3xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-sm text-gray-500">Total docs</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-sm text-gray-500">Draft</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{stats.draft}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-sm text-gray-500">In Review</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{stats.review}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-4 text-center">
            <p className="text-sm text-gray-500">Signed</p>
            <p className="mt-2 text-xl font-semibold text-gray-900">{stats.signed}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_0.9fr] gap-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Upload documents</h2>
                <p className="text-sm text-gray-500">Drag files here or choose from your computer to add contracts and deals.</p>
              </div>
              <Button
                variant="primary"
                leftIcon={<UploadCloud size={16} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload file
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = event.target.files;
                  if (!files) return;
                  Array.from(files).forEach(handleFileUpload);
                  event.target.value = '';
                }}
              />
            </div>

            <div
              className={`rounded-3xl border-2 border-dashed p-8 text-center transition ${dragActive ? 'border-primary-400 bg-primary-50' : 'border-slate-200 bg-slate-50'}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <UploadCloud size={32} className="mx-auto text-primary-600" />
              <p className="mt-4 text-sm text-slate-600">Drag & drop documents here to upload</p>
              <p className="mt-1 text-sm text-slate-500">PDF, DOCX, or image files supported for mock upload.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Document list</h2>
                <p className="text-sm text-gray-500">Search, filter and preview your documents.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Input
                  placeholder="Search by name or party"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  startAdornment={<Search size={16} />}
                />
                <select
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-primary-500 sm:w-52"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                >
                  <option value="All">All statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="In Review">In Review</option>
                  <option value="Signed">Signed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
                  No documents match the current filters.
                </div>
              ) : (
                filteredDocuments.map(doc => (
                  <div key={doc.id} className="rounded-3xl border border-slate-200 p-5 hover:shadow-lg transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <Badge variant={statusVariants[doc.status]}>{doc.status}</Badge>
                          <p className="font-semibold text-gray-900">{doc.name}</p>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">{doc.type} · {doc.size} · {doc.pages} pages</p>
                        <p className="text-sm text-slate-500">Parties: {doc.parties}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Button variant="outline" size="sm" onClick={() => openPreview(doc)} leftIcon={<Eye size={14} />}>
                          Preview
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => openSignatureModal(doc)} leftIcon={<CheckCircle2 size={14} />}>
                          Sign
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteDocument(doc.id)} leftIcon={<Trash2 size={14} />}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status guide</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <Badge variant="gray">Draft</Badge>
                <p className="text-sm text-slate-600">Work in progress documents awaiting review.</p>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <Badge variant="accent">In Review</Badge>
                <p className="text-sm text-slate-600">Documents under review by stakeholders.</p>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <Badge variant="success">Signed</Badge>
                <p className="text-sm text-slate-600">Finalized documents with signatures applied.</p>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <Badge variant="error">Rejected</Badge>
                <p className="text-sm text-slate-600">Documents that need changes before signing.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload status</h2>
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>New uploads</span>
                  <span>{documents.length}</span>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Ready for signature</span>
                  <span>{documents.filter(doc => doc.status !== 'Signed').length}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showPreview && activeDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Preview: {activeDocument.name}</h3>
                <p className="text-sm text-slate-500">Page {previewPage} of {activeDocument.pages}</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>
            <div className="p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setPreviewPage(prev => Math.max(1, prev - 1))} leftIcon={<ArrowLeft size={14} />}>
                  Prev
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreviewPage(prev => Math.min(activeDocument.pages, prev + 1))} rightIcon={<ArrowRight size={14} />}>
                  Next
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}>Zoom out</Button>
                <Button variant="ghost" size="sm" onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.25))}>Zoom in</Button>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-6" style={{ minHeight: '360px' }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_25%)]" />
                <div className="relative z-10 text-slate-100">
                  <p className="text-sm text-slate-400">Simulated PDF preview — page {previewPage} at {zoomLevel * 100}% zoom.</p>
                  <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-950 p-8 text-center">
                    <FileText size={40} className="mx-auto text-slate-400" />
                    <p className="mt-4 text-xl font-semibold text-white">{activeDocument.name}</p>
                    <p className="mt-2 text-sm text-slate-500">This is a mock preview page for the document chamber.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignatureModal && activeDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-6">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">E-Signature for {activeDocument.name}</h3>
                <p className="text-sm text-slate-500">Choose Draw or Type to apply a signature.</p>
              </div>
              <button onClick={() => setShowSignatureModal(false)} className="text-slate-500 hover:text-slate-900">Close</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-3">
                <button
                  className={`rounded-full px-4 py-2 text-sm font-medium ${signatureTab === 'draw' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  onClick={() => setSignatureTab('draw')}
                >
                  Draw
                </button>
                <button
                  className={`rounded-full px-4 py-2 text-sm font-medium ${signatureTab === 'type' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  onClick={() => setSignatureTab('type')}
                >
                  Type
                </button>
              </div>

              {signatureTab === 'draw' ? (
                <div className="rounded-3xl border border-slate-200 p-4">
                  <canvas
                    ref={canvasRef}
                    width={900}
                    height={200}
                    className="w-full rounded-3xl border border-slate-300 bg-slate-50"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                  />
                  <div className="mt-4 flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={clearCanvas}>Clear</Button>
                    <span className="text-sm text-slate-500">{canvasDataUrl ? 'Signature drawn' : 'Draw your signature above'}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <Input
                    label="Type your signature"
                    placeholder="Your name"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    fullWidth
                  />
                  <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-600">Preview</p>
                    <p className="mt-4 text-3xl font-semibold text-slate-900">{typedSignature || 'Your signature will appear here'}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  id="legal-check"
                  type="checkbox"
                  checked={legalChecked}
                  onChange={(e) => setLegalChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="legal-check" className="text-sm text-slate-700">
                  I agree that this signature is legally binding and accurate.
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="success" onClick={applySignature} leftIcon={<CheckCircle2 size={16} />}>
                  Apply signature
                </Button>
                <Button variant="outline" onClick={() => setShowSignatureModal(false)}>Cancel</Button>
              </div>
              <p className="text-sm text-slate-500">{signLabel}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
