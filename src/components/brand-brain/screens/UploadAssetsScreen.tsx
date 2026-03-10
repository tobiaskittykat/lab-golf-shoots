// Stub - UploadAssetsScreen
export default function UploadAssetsScreen({ files, onFilesChange }: { files: File[]; onFilesChange: (f: File[]) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Upload Assets</h2>
      <p className="text-muted-foreground">Upload your brand assets like logos, images, and guidelines.</p>
      <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">Drag & drop files here or click to browse</p>
      </div>
    </div>
  );
}
