import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import type { SocialConnection } from "@/hooks/useBrandDrafts";
interface DigitalFootprintScreenProps { connections: Record<string, SocialConnection>; onChange: (c: Record<string, SocialConnection>) => void; }
const CHANNELS = [
  { key:"website", label:"Website", placeholder:"https://www.example.com" },
  { key:"instagram", label:"Instagram", placeholder:"https://instagram.com/brand" },
  { key:"facebook", label:"Facebook", placeholder:"https://facebook.com/brand" },
  { key:"twitter", label:"X (Twitter)", placeholder:"https://x.com/brand" },
  { key:"tiktok", label:"TikTok", placeholder:"https://tiktok.com/@brand" },
];
const DigitalFootprintScreen = ({ connections, onChange }: DigitalFootprintScreenProps) => (
  <div className="space-y-6 animate-fade-in">
    <div><h2 className="font-display text-2xl font-bold mb-2">Digital Footprint</h2><p className="text-muted-foreground">Connect your social channels (all optional).</p></div>
    <div className="space-y-4">{CHANNELS.map(ch=>{const conn=connections[ch.key]||{url:"",connected:false};return(<div key={ch.key} className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0"><Globe className="w-5 h-5 text-muted-foreground"/></div><div className="flex-1"><Label className="text-sm">{ch.label}</Label><Input value={conn.url} onChange={e=>onChange({...connections,[ch.key]:{url:e.target.value,connected:e.target.value.length>0}})} placeholder={ch.placeholder} className="mt-1"/></div></div>)})}</div>
  </div>
);
export default DigitalFootprintScreen;
