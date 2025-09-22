import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createTask, getTaskStatus } from './services/seedreamService';
import type { CreateTaskPayload, ImageResolution, ImageSize, ResultJson, TaskState } from './types';
import { IMAGE_RESOLUTION_OPTIONS, IMAGE_SIZE_OPTIONS, DEFAULT_PROMPT, DEFAULT_IMAGE_URL } from './constants';

import Textarea from './components/Textarea';
import Select from './components/Select';
import Input from './components/Input';
import Button from './components/Button';
import Spinner from './components/Spinner';

// --- Helper Functions ---
const downloadImage = async (imageUrl: string, filename = 'generated-image.png') => {
    try {
      // Use a proxy or server-side fetch if CORS is an issue, but try direct fetch first.
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Network response was not ok, status: ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Failed to download image:', error);
      // Fallback for CORS issues: open in new tab
      window.open(imageUrl, '_blank');
    }
};


// --- Helper Components ---

/**
 * A component for uploading an image via file selection, drag-and-drop, or URL input.
 */
interface ImageUploaderProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  label: string;
  uploadError: string | null;
  setUploadError: (error: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, setImageUrl, label, uploadError, setUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFileToHostingService = async (file: File): Promise<string> => {
    // This uses a public, free-tier API key for a third-party image hosting service (imgbb).
    // This allows the app to get a public URL for a locally uploaded file.
    const IMG_HOSTING_API_KEY = '91ae253c1ca820f839c089373a007f03';
    const UPLOAD_URL = `https://api.imgbb.com/1/upload?key=${IMG_HOSTING_API_KEY}`;
    
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || 'Failed to upload image to hosting service.');
    }

    const result = await response.json();
    if (result.success && result.data.url) {
      return result.data.url;
    } else {
      throw new Error(result.error?.message || 'Image hosting service returned an unexpected error.');
    }
  };


  const handleFileChange = async (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Invalid file type. Please select a JPG, PNG, or WEBP image.');
        return;
      }

      setIsUploading(true);
      setUploadError(null);
      try {
        const publicUrl = await uploadFileToHostingService(file);
        setImageUrl(publicUrl);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'An unknown error occurred during upload.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const clearImage = () => {
    setImageUrl('');
    setUploadError(null);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      
      {imageUrl ? (
        <div className="relative group">
          <img src={imageUrl} alt="Reference preview" className="w-full h-auto max-h-80 object-contain rounded-lg bg-gray-700" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
            aria-label="Remove image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-blue-500 bg-gray-700' : 'border-gray-600 hover:border-gray-500'}`}
        >
        {isUploading ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
               <Spinner />
               <p className="mt-2 font-semibold">Uploading image...</p>
               <p className="text-sm">Please wait.</p>
            </div>
        ) : (
            <>
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileChange(e.target.files)}
                accept="image/jpeg,image/png,image/webp"
                id="image-upload"
                disabled={isUploading}
              />
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center text-gray-400 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="font-semibold">Drag & drop an image here</p>
                <p className="text-sm">or click to select a file</p>
              </label>
            </>
        )}
        </div>
      )}
      {uploadError && <p className="mt-2 text-sm text-red-400">{uploadError}</p>}
      <div className="flex items-center mt-4">
        <div className="flex-grow border-t border-gray-700"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
        <div className="flex-grow border-t border-gray-700"></div>
      </div>
      
      <input
        type="url"
        value={imageUrl}
        onChange={(e) => { setImageUrl(e.target.value); setUploadError(null); }}
        placeholder="Paste an image URL"
        className="mt-4 w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
        aria-label="Image URL"
      />
    </div>
  );
};


/**
 * A modal for viewing and interacting with a single image.
 */
const ImageModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({ imageUrl, onClose }) => {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const startPanPoint = useRef({ x: 0, y: 0 });

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prevScale => direction === 'in' ? prevScale * 1.2 : prevScale / 1.2);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoom('in');
    } else {
      handleZoom('out');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    startPanPoint.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPan({
      x: e.clientX - startPanPoint.current.x,
      y: e.clientY - startPanPoint.current.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const resetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Reset pan if image is zoomed out completely
  useEffect(() => {
    if (scale <= 1) {
        setPan({ x: 0, y: 0 });
    }
  }, [scale]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center" onWheel={handleWheel} onClick={e => e.stopPropagation()}>
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Zoomed preview"
          className="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-200"
          style={{ transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`, cursor: isPanning ? 'grabbing' : (scale > 1 ? 'grab' : 'default') }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <button onClick={() => downloadImage(imageUrl, `generated-image-${Date.now()}.png`)} className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors" title="Download Image">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
        <button onClick={onClose} className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors" title="Close (Esc)">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-gray-800 rounded-full" onClick={e => e.stopPropagation()}>
        <button onClick={() => handleZoom('out')} className="p-2 text-white hover:text-blue-400 transition-colors" title="Zoom Out"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg></button>
        <button onClick={resetZoom} className="p-2 text-white hover:text-blue-400 transition-colors text-sm font-mono" title="Reset Zoom">{(scale * 100).toFixed(0)}%</button>
        <button onClick={() => handleZoom('in')} className="p-2 text-white hover:text-blue-400 transition-colors" title="Zoom In"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg></button>
      </div>
    </div>
  );
};


/**
 * A component to display generated images or an error message.
 */
const ResultDisplay: React.FC<{ 
    images: string[], 
    status: TaskState | null, 
    error: string | null,
    onImageSelect: (url: string) => void,
}> = ({ images, status, error, onImageSelect }) => {
  if (status === 'success' && images.length > 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-4">Generated Images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer" onClick={() => onImageSelect(url)}>
              <img src={url} alt={`Generated image ${index + 1}`} className="w-full h-auto object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                
                 <div className="flex items-center space-x-4">
                     <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                     </div>
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(url, `generated-image-${index + 1}.png`);
                        }}
                        title="Download Image"
                        className="p-3 bg-white/20 rounded-full backdrop-blur-sm transition-transform hover:scale-110"
                        aria-label="Download image"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                     </button>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'fail' && error) {
    return (
      <div className="mt-8 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
        <h3 className="font-bold">Generation Failed</h3>
        <p>{error}</p>
      </div>
    );
  }

  return null;
};


// --- Main Application Component ---

const App: React.FC = () => {
  // Form State
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE_URL);
  const [imageSize, setImageSize] = useState<ImageSize>('square_hd');
  const [imageResolution, setImageResolution] = useState<ImageResolution>('1K');
  const [maxImages, setMaxImages] = useState<number>(1);
  const [seed, setSeed] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Task State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskState | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handlePoll = useCallback(async () => {
    if (!taskId) return;
    
    setLoadingMessage("Checking task status...");
    try {
      const response = await getTaskStatus(taskId);
      const { state, resultJson, failMsg } = response.data;
      
      setTaskStatus(state);
      
      if (state === 'success') {
        clearPolling();
        setIsLoading(false);
        setLoadingMessage('');
        if (resultJson) {
          try {
            const parsedResult: ResultJson = JSON.parse(resultJson);
            setGeneratedImages(parsedResult.resultUrls || []);
          } catch (e) {
            setError('Failed to parse result data.');
            setTaskStatus('fail');
          }
        }
      } else if (state === 'fail') {
        clearPolling();
        setIsLoading(false);
        setLoadingMessage('');
        setError(failMsg || 'An unknown error occurred.');
      } else {
         setLoadingMessage("Task is processing, please wait...");
      }
    } catch (err) {
      clearPolling();
      setIsLoading(false);
      setLoadingMessage('');
      setError(err instanceof Error ? err.message : 'Failed to poll task status.');
      setTaskStatus('fail');
    }
  }, [taskId]);
  
  useEffect(() => {
    if (taskId && !['success', 'fail'].includes(taskStatus || '')) {
      pollingIntervalRef.current = setInterval(handlePoll, 3000);
    }
    
    return () => {
      clearPolling();
    };
  }, [taskId, taskStatus, handlePoll]);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setTaskStatus(null);
    
    if (uploadError) {
        setError("Please resolve the image upload error before generating.");
        setTaskStatus('fail');
        return;
    }

    if (!imageUrl.trim()) {
      setError("Please provide a reference image by uploading a file or pasting a URL.");
      setTaskStatus('fail');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Creating generation task...");
    setTaskId(null);
    setGeneratedImages([]);
    clearPolling();

    const payload: CreateTaskPayload = {
      model: 'bytedance/seedream-v4-edit',
      input: {
        prompt,
        image_urls: [imageUrl],
        image_size: imageSize,
        image_resolution: imageResolution,
        max_images: maxImages,
      },
    };
    if (seed && !isNaN(parseInt(seed, 10))) {
        payload.input.seed = parseInt(seed, 10);
    }

    try {
      const newTaskId = await createTask(payload);
      setTaskId(newTaskId);
      setTaskStatus('waiting');
      setLoadingMessage("Task created! Waiting for results...");
    } catch (err) {
      setIsLoading(false);
      setLoadingMessage('');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setTaskStatus('fail');
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Seedream Image Editor
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Edit images with AI using the Seedream V4 Edit model.
          </p>
        </header>
        
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              label="Prompt"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              maxLength={5000}
            />
            
            <ImageUploader 
                label="Reference Image" 
                imageUrl={imageUrl} 
                setImageUrl={setImageUrl} 
                uploadError={uploadError}
                setUploadError={setUploadError}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Image Size"
                id="image-size"
                options={IMAGE_SIZE_OPTIONS}
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as ImageSize)}
              />
              <Select
                label="Image Resolution"
                id="image-resolution"
                options={IMAGE_RESOLUTION_OPTIONS}
                value={imageResolution}
                onChange={(e) => setImageResolution(e.target.value as ImageResolution)}
              />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label htmlFor="max-images" className="block text-sm font-medium text-gray-300 mb-2">Max Images: {maxImages}</label>
                  <input
                    type="range"
                    id="max-images"
                    min="1"
                    max="6"
                    step="1"
                    value={maxImages}
                    onChange={(e) => setMaxImages(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
               </div>
              <Input
                label="Seed (Optional)"
                id="seed"
                type="number"
                placeholder="e.g., 42"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Spinner />
                  {loadingMessage}
                </span>
              ) : (
                'Generate Images'
              )}
            </Button>
          </form>
        </div>

        <ResultDisplay 
          images={generatedImages} 
          status={taskStatus} 
          error={error} 
          onImageSelect={setZoomedImageUrl}
        />

      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Built with React & Tailwind CSS</p>
      </footer>
      
      {zoomedImageUrl && (
          <ImageModal imageUrl={zoomedImageUrl} onClose={() => setZoomedImageUrl(null)} />
      )}
    </div>
  );
};

export default App;
