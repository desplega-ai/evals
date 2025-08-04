"use client";

import Link from "next/link";
import { useState, useRef } from "react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export default function FilesPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handleDownloadSamplePdf = () => {
    const link = document.createElement('a');
    link.href = '/sample-pdf.pdf';
    link.download = 'sample-pdf.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadUploadedFile = (uploadedFile: UploadedFile) => {
    const url = URL.createObjectURL(uploadedFile.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = uploadedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Files Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
            
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors bg-white"
              >
                <div className="text-center">
                  <p className="text-gray-600">Click to upload files</p>
                  <p className="text-sm text-gray-400 mt-1">Multiple files allowed</p>
                </div>
              </button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-700 mb-2">Uploaded Files ({uploadedFiles.length})</h3>
                {uploadedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="ml-3 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Download */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Download Files</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Sample File</h3>
                <button
                  onClick={handleDownloadSamplePdf}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Download Sample PDF
                </button>
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Your Uploaded Files</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map(file => (
                      <button
                        key={file.id}
                        onClick={() => handleDownloadUploadedFile(file)}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}