import { useState } from "react";
import { Upload, FileText, Image, Folder, Cloud, Check, Loader2 } from "lucide-react";

interface UploadAssetsScreenProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const parsingMessages = [
  "Extracting color palette...",
  "Detecting typography rules...",
  "Analyzing logo usage patterns...",
  "Identifying visual themes...",
  "Processing campaign imagery...",
];

const UploadAssetsScreen = ({ files, onFilesChange }: UploadAssetsScreenProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsing, setParsing] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFilesChange([...files, ...droppedFiles]);
    simulateParsing();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onFilesChange([...files, ...selectedFiles]);
      simulateParsing();
    }
  };

  const simulateParsing = () => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < parsingMessages.length) {
        setParsing(parsingMessages[i]);
        i++;
      } else {
        setParsing(null);
        clearInterval(interval);
      }
    }, 1500);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return Image;
    if (file.type.includes("pdf") || file.type.includes("document")) return FileText;
    return Folder;
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Show me what you've got</h1>
      <p className="text-muted-foreground mb-2">
        Drop everything you have — I'll sort it out.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Brand books, campaign decks, logos, fonts, moodboards, even competitor references.
      </p>

      <div className="space-y-6">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/30"
          }`}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-lg font-medium mb-1">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, PPT, PNG, JPG, SVG, AI, and more • No size limit
          </p>
        </div>

        {/* Cloud Import Options */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
            <Cloud className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Google Drive</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
            <Cloud className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Dropbox</span>
          </button>
        </div>

        {/* Parsing Status */}
        {parsing && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-primary font-medium">{parsing}</span>
          </div>
        )}

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-3">{files.length} files added</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((file, index) => {
                const Icon = getFileIcon(file);
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reassurance */}
        <p className="text-sm text-muted-foreground text-center">
          ✨ Don't worry about organizing — I'll identify and categorize everything automatically
        </p>
      </div>
    </div>
  );
};

export default UploadAssetsScreen;
