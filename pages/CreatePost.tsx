
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MockService } from '../services/mockService';
import { Button } from '../components/Button';
import { Image, Video, X } from 'lucide-react';

export const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setMediaType(type);
    }
  };

  const removeMedia = () => {
    setPreviewUrl(null);
    setMediaType(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption && !previewUrl) return;

    setIsUploading(true);
    
    try {
      let uploadedUrl: string | undefined = undefined;

      if (selectedFile) {
        uploadedUrl = await MockService.uploadFile(selectedFile);
      } else if (previewUrl) {
        // Fallback if preview URL was set differently (not via file input in this flow)
        // In this implementation, we only support direct file uploads
        uploadedUrl = undefined;
      }

      await MockService.createPost({
        authorId: user.id,
        authorName: user.fullName,
        authorAvatar: user.avatarUrl,
        caption,
        imageUrl: mediaType === 'image' ? uploadedUrl : undefined,
        videoUrl: mediaType === 'video' ? uploadedUrl : undefined,
      });

      setIsUploading(false);
      navigate('/');
    } catch (error) {
      console.error("Failed to create post", error);
      setIsUploading(false);
      alert("Failed to create post. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Create Post</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><X className="h-5 w-5" /></Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex gap-4 mb-6">
            <img src={user.avatarUrl} alt="Me" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1">
              <span className="block font-semibold text-gray-900 mb-1">{user.fullName}</span>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Share your thoughts, stories, or ideas..."
                className="w-full border-none focus:ring-0 resize-none text-lg placeholder-gray-400 min-h-[150px] p-0"
              />
            </div>
          </div>

          {previewUrl && (
            <div className="relative mb-6 rounded-lg overflow-hidden border border-gray-200 bg-black">
               {mediaType === 'video' ? (
                 <video src={previewUrl} controls className="w-full max-h-96 object-contain mx-auto" />
               ) : (
                 <img src={previewUrl} alt="Preview" className="w-full max-h-96 object-contain bg-gray-50" />
               )}
               <button 
                 type="button" 
                 onClick={removeMedia}
                 className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 z-10"
               >
                 <X className="h-5 w-5" />
               </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex space-x-2">
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e, 'image')}
                />
                <button type="button" className="flex items-center gap-2 px-3 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-sm font-medium pointer-events-none">
                  <Image className="h-5 w-5" />
                  <span>Photo</span>
                </button>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept="video/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e, 'video')}
                />
                <button type="button" className="flex items-center gap-2 px-3 py-2 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors text-sm font-medium pointer-events-none">
                  <Video className="h-5 w-5" />
                  <span>Video</span>
                </button>
              </div>
            </div>

            <Button type="submit" isLoading={isUploading} disabled={!caption && !previewUrl}>
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
