import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
interface BrandBasicsData { name: string; website: string; industry: string; markets: string[]; personality: string; brandContext?: any; }
interface BrandBasicsScreenProps { data: BrandBasicsData; onChange: (data: BrandBasicsData) => void; }
const INDUSTRY_OPTIONS = ["Fashion & Apparel","Beauty & Cosmetics","Food & Beverage","Technology","Health & Wellness","Home & Living","Other"];
const MARKET_OPTIONS = ["North America","Europe","Asia Pacific","Latin America","Middle East & Africa","Global"];
const BrandBasicsScreen = ({ data, onChange }: BrandBasicsScreenProps) => (
  <div className="space-y-6 animate-fade-in">
    <div><h2 className="font-display text-2xl font-bold mb-2">Brand Basics</h2><p className="text-muted-foreground">Tell us about your brand.</p></div>
    <div className="space-y-4">
      <div><Label>Brand Name *</Label><Input value={data.name} onChange={e=>onChange({...data,name:e.target.value})} placeholder="e.g. Birkenstock" className="mt-1.5"/></div>
      <div><Label>Website</Label><Input type="url" value={data.website} onChange={e=>onChange({...data,website:e.target.value})} placeholder="https://www.example.com" className="mt-1.5"/></div>
      <div><Label>Industry</Label><select value={data.industry} onChange={e=>onChange({...data,industry:e.target.value})} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="">Select...</option>{INDUSTRY_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}</select></div>
      <div><Label>Target Markets</Label><div className="flex flex-wrap gap-2 mt-1.5">{MARKET_OPTIONS.map(m=>(<button key={m} onClick={()=>onChange({...data,markets:data.markets.includes(m)?data.markets.filter(x=>x!==m):[...data.markets,m]})} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${data.markets.includes(m)?'bg-primary text-primary-foreground border-primary':'border-border hover:border-primary/40'}`}>{m}</button>))}</div></div>
      <div><Label>Brand Personality</Label><Textarea value={data.personality} onChange={e=>onChange({...data,personality:e.target.value})} placeholder="Describe your brand's personality..." rows={3} className="mt-1.5"/></div>
    </div>
  </div>
);
export default BrandBasicsScreen;
