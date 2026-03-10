// Stub - BrandBasicsScreen
export default function BrandBasicsScreen({ data, onChange, onSocialLinksFound }: { data: any; onChange: (d: any) => void; onSocialLinksFound?: (links: Record<string, string>) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Brand Basics</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Brand Name</label>
          <input type="text" value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/20" placeholder="Your brand name" />
        </div>
        <div>
          <label className="text-sm font-medium">Website</label>
          <input type="text" value={data.website} onChange={e => onChange({ ...data, website: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/20" placeholder="https://..." />
        </div>
        <div>
          <label className="text-sm font-medium">Industry</label>
          <input type="text" value={data.industry} onChange={e => onChange({ ...data, industry: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-accent/20" placeholder="e.g., Fashion, Technology" />
        </div>
      </div>
    </div>
  );
}
