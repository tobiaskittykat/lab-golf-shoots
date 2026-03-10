// Stub - SummaryScreen
export default function SummaryScreen({ brandData }: { brandData: any }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Summary</h2>
      <p className="text-muted-foreground">Review your brand setup before saving.</p>
      <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-2">
        <p><strong>Name:</strong> {brandData.basics.name || 'Not set'}</p>
        <p><strong>Website:</strong> {brandData.basics.website || 'Not set'}</p>
        <p><strong>Industry:</strong> {brandData.basics.industry || 'Not set'}</p>
      </div>
    </div>
  );
}
