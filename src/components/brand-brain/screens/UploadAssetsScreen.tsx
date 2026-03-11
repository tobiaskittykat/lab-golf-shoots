import { Upload, X } from "lucide-react";
import { useRef } from "react";
interface UploadAssetsScreenProps { files: File[]; onFilesChange: (files: File[]) => void; }
const UploadAssetsScreen = ({ files, onFilesChange }: UploadAssetsScreenProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const handleFiles = (fl: FileList|null) => { if(fl) onFilesChange([...files,...Array.from(fl).filter(f=>f.type.startsWith("image/"))]); };
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="font-display text-2xl font-bold mb-2">Upload Brand Assets</h2><p className="text-muted-foreground">Upload logos, product photos, or campaign images.</p></div>
      <div onClick={()=>ref.current?.click()} onDragOver={e=>{e.preventDefault()}} onDrop={e=>{e.preventDefault();handleFiles(e.dataTransfer.files)}} className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/40 transition-colors">
        <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground"/><p className="font-medium mb-1">Drop images here or click to upload</p><p className="text-sm text-muted-foreground">PNG, JPG, WebP</p>
        <input ref={ref} type="file" accept="image/*" multiple onChange={e=>handleFiles(e.target.files)} className="hidden"/>
      </div>
      {files.length>0&&<div className="grid grid-cols-4 gap-3">{files.map((f,i)=>(<div key={i} className="relative group"><div className="aspect-square rounded-lg overflow-hidden bg-secondary border border-border"><img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover"/></div><button onClick={()=>onFilesChange(files.filter((_,idx)=>idx!==i))} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button></div>))}</div>}
    </div>
  );
};
export default UploadAssetsScreen;
