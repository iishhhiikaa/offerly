import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CleanCard from '../../../../components/auth/CleanCard';
import CleanButton from '../../../../components/auth/CleanButton';
import toast from 'react-hot-toast';

const documentTypes = [
  { type: 'aadhaar_front', label: 'Aadhaar Card (Front)', required: true, accept: 'image/*,application/pdf', maxSize: 5 },
  { type: 'aadhaar_back', label: 'Aadhaar Card (Back)', required: true, accept: 'image/*,application/pdf', maxSize: 5 },
  { type: 'pan_card', label: 'PAN Card', required: true, accept: 'image/*,application/pdf', maxSize: 5 },
  { type: 'owner_photo', label: 'Owner Photo', required: true, accept: 'image/*', maxSize: 2 },
  { type: 'business_registration', label: 'Business Registration', required: true, accept: 'image/*,application/pdf', maxSize: 5 },
  { type: 'store_front_photo', label: 'Store Front Photo', required: true, accept: 'image/*', maxSize: 5 },
];

const KYBDocumentsStep = ({ data, category, onSubmit, onBack, loading }) => {
  const [documents, setDocuments] = useState(data.documents || []);
  const [gstNumber, setGstNumber] = useState(data.gstNumber || '');
  const [errors, setErrors] = useState({});
  const fileInputRefs = useRef({});

  const [uploadingDoc, setUploadingDoc] = useState(null);

  const handleFileUpload = (docType, label) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const docConfig = documentTypes.find(d => d.type === docType);
    const maxSize = docConfig.maxSize * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(`File size should be less than ${docConfig.maxSize}MB`);
      return;
    }

    try {
      setUploadingDoc(docType);

      // Upload to server
      const { uploadAPI } = await import('../../../../api/upload.api');
      const response = await uploadAPI.uploadImage(file);
      const imageUrl = response?.url || response;

      // Validate that we got a valid URL
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
        throw new Error('Invalid URL received from server');
      }

      const newDoc = {
        type: docType,
        label: label,
        url: imageUrl,
        name: file.name,
        size: file.size
      };

      setDocuments(prev => {
        const filtered = prev.filter(d => d.type !== docType);
        return [...filtered, newDoc];
      });

      toast.success(`${label} uploaded successfully!`);
      
      if (errors[docType]) {
        setErrors(prev => ({ ...prev, [docType]: '' }));
      }
    } catch (error) {
      console.error('Document upload error:', error);
      toast.error(`Failed to upload ${label}. Please try again.`);
      
      // Remove any partial document entry
      setDocuments(prev => prev.filter(d => d.type !== docType));
      
      // Set error state
      setErrors(prev => ({ ...prev, [docType]: `Upload failed for ${label}` }));
    } finally {
      setUploadingDoc(null);
      // Reset file input
      if (fileInputRefs.current[docType]) {
        fileInputRefs.current[docType].value = '';
      }
    }
  };

  const isDocumentUploaded = (docType) => {
    return documents.some(d => d.type === docType && d.url && d.url.trim() !== '');
  };

  const validate = () => {
    const newErrors = {};

    documentTypes.forEach(doc => {
      if (doc.required) {
        const uploadedDoc = documents.find(d => d.type === doc.type);
        
        if (!uploadedDoc) {
          newErrors[doc.type] = `${doc.label} is required`;
        } else if (!uploadedDoc.url || uploadedDoc.url.trim() === '') {
          newErrors[doc.type] = `${doc.label} upload failed. Please try again`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if any upload is in progress
    if (uploadingDoc) {
      toast.error('Please wait for all uploads to complete');
      return;
    }
    
    if (!validate()) {
      toast.error('Please upload all required documents with valid URLs');
      return;
    }

    // Final validation: ensure all documents have valid URLs
    const invalidDocs = documents.filter(doc => !doc.url || doc.url.trim() === '');
    if (invalidDocs.length > 0) {
      toast.error('Some documents are missing URLs. Please re-upload them.');
      return;
    }

    onSubmit({ documents, gstNumber });
  };

  return (
    <CleanCard title="Offerly — KYB Documents" showHeader={false} className="mx-auto">
      <div className="p-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          KYB Documents
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Upload verification documents to complete your registration
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Owner Documents */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Owner Documents</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.slice(0, 4).map((doc) => (
              <div key={doc.type}>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {doc.label} {doc.required && <span className="text-red-500">*</span>}
                </label>
                
                {!isDocumentUploaded(doc.type) ? (
                  <div 
                    onClick={() => uploadingDoc !== doc.type && fileInputRefs.current[doc.type]?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors h-[120px] flex flex-col items-center justify-center ${
                      uploadingDoc === doc.type 
                        ? 'border-blue-400 bg-blue-50 cursor-wait' 
                        : 'border-gray-300 hover:border-primary-700 cursor-pointer'
                    }`}
                  >
                    {uploadingDoc === doc.type ? (
                      <>
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-700 mb-1"></div>
                        <div className="text-xs font-medium text-primary-700">Uploading...</div>
                      </>
                    ) : (
                      <>
                        <UploadFileRoundedIcon className="text-gray-400 mb-1" sx={{ fontSize: 28 }} />
                        <div className="text-xs font-medium text-gray-700">Click to upload</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Max {doc.maxSize}MB</div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-3 bg-green-50 h-[120px] flex flex-col justify-between relative overflow-hidden group">
                    <div className="flex items-center gap-3">
                      {/* Show preview if it's an image */}
                      {documents.find(d => d.type === doc.type)?.url ? (
                        <img 
                          src={documents.find(d => d.type === doc.type)?.url} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded border border-green-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white rounded border border-green-200 flex items-center justify-center">
                          <CheckCircleRoundedIcon className="text-green-600" sx={{ fontSize: 20 }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {documents.find(d => d.type === doc.type)?.name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {((documents.find(d => d.type === doc.type)?.size || 0) / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocuments(prev => prev.filter(d => d.type !== doc.type))}
                      className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <span className="text-lg leading-none">×</span>
                    </button>
                    <div className="flex items-center gap-1 mt-auto">
                      <CheckCircleRoundedIcon className="text-green-600" sx={{ fontSize: 14 }} />
                      <span className="text-[10px] text-green-700 font-medium">Uploaded</span>
                    </div>
                  </div>
                )}
                
                <input
                  ref={el => fileInputRefs.current[doc.type] = el}
                  type="file"
                  accept={doc.accept}
                  onChange={handleFileUpload(doc.type, doc.label)}
                  className="hidden"
                />
                
                {errors[doc.type] && <p className="text-[10px] text-red-500 mt-1">{errors[doc.type]}</p>}
              </div>
            ))}
          </div>

          {/* Business Documents */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 mt-6">
            <h3 className="text-sm font-semibold text-green-900 mb-2">🏢 Business Documents</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.slice(4).map((doc) => (
              <div key={doc.type}>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  {doc.label} {doc.required && <span className="text-red-500">*</span>}
                </label>
                
                {!isDocumentUploaded(doc.type) ? (
                  <div 
                    onClick={() => uploadingDoc !== doc.type && fileInputRefs.current[doc.type]?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors h-[120px] flex flex-col items-center justify-center ${
                      uploadingDoc === doc.type 
                        ? 'border-blue-400 bg-blue-50 cursor-wait' 
                        : 'border-gray-300 hover:border-primary-700 cursor-pointer'
                    }`}
                  >
                    {uploadingDoc === doc.type ? (
                      <>
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-700 mb-1"></div>
                        <div className="text-xs font-medium text-primary-700">Uploading...</div>
                      </>
                    ) : (
                      <>
                        <UploadFileRoundedIcon className="text-gray-400 mb-1" sx={{ fontSize: 28 }} />
                        <div className="text-xs font-medium text-gray-700">Click to upload</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Max {doc.maxSize}MB</div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-3 bg-green-50 h-[120px] flex flex-col justify-between relative overflow-hidden group">
                    <div className="flex items-center gap-3">
                      {/* Show preview if it's an image */}
                      {documents.find(d => d.type === doc.type)?.url ? (
                        <img 
                          src={documents.find(d => d.type === doc.type)?.url} 
                          alt="Preview" 
                          className="w-12 h-12 object-cover rounded border border-green-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white rounded border border-green-200 flex items-center justify-center">
                          <CheckCircleRoundedIcon className="text-green-600" sx={{ fontSize: 20 }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {documents.find(d => d.type === doc.type)?.name}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {((documents.find(d => d.type === doc.type)?.size || 0) / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocuments(prev => prev.filter(d => d.type !== doc.type))}
                      className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <span className="text-lg leading-none">×</span>
                    </button>
                    <div className="flex items-center gap-1 mt-auto">
                      <CheckCircleRoundedIcon className="text-green-600" sx={{ fontSize: 14 }} />
                      <span className="text-[10px] text-green-700 font-medium">Uploaded</span>
                    </div>
                  </div>
                )}
                
                <input
                  ref={el => fileInputRefs.current[doc.type] = el}
                  type="file"
                  accept={doc.accept}
                  onChange={handleFileUpload(doc.type, doc.label)}
                  className="hidden"
                />
                
                {errors[doc.type] && <p className="text-[10px] text-red-500 mt-1">{errors[doc.type]}</p>}
              </div>
            ))}
          </div>

          {/* GST Number (Optional) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              GST Number (Optional)
            </label>
            <input
              type="text"
              placeholder="22AAAAA0000A1Z5"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              className="w-full h-12 bg-[#FAFBFC] border border-gray-200 rounded-lg px-4 text-[15px] text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-primary-700 focus:ring-4 focus:ring-primary-700/10 focus:outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1.5">If you have GST registration</p>
          </div>

          {/* Document Upload Summary */}
          {documents.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-green-900 mb-2">
                ✓ Uploaded Documents ({documents.length}/{documentTypes.length})
              </h4>
              <div className="space-y-1">
                {documents.map(doc => (
                  <div key={doc.type} className="text-xs text-green-700 flex items-center gap-2">
                    <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                    <span>{doc.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">ℹ️ Document Guidelines</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• All documents must be clear & readable</li>
              <li>• No blurred or cropped images</li>
              <li>• Documents must be valid & not expired</li>
              <li>• Owner name must match across documents</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <CleanButton
              type="button"
              variant="secondary"
              onClick={onBack}
              icon={ArrowBackRoundedIcon}
              iconPosition="left"
            >
              Back
            </CleanButton>

            <CleanButton
              type="submit"
              disabled={loading || uploadingDoc !== null}
              loading={loading}
              icon={ArrowForwardRoundedIcon}
              className="flex-1"
            >
              {uploadingDoc ? 'Uploading...' : 'Continue to Location'}
            </CleanButton>
          </div>
        </form>
      </div>
    </CleanCard>
  );
};

export default KYBDocumentsStep;
