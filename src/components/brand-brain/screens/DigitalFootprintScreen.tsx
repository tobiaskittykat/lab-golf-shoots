// Stub - DigitalFootprintScreen
export default function DigitalFootprintScreen({ connections, onChange }: { connections: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Digital Footprint</h2>
      <p className="text-muted-foreground">Connect your social media accounts to enrich your brand profile.</p>
      <div className="space-y-3">
        {Object.entries(connections).map(([key, value]: [string, any]) => (
          <div key={key} className="flex items-center gap-3 p-3 rounded-lg border border-border">
            <span className="capitalize font-medium w-24">{key}</span>
            <input
              type="text"
              value={value.url}
              onChange={e => onChange({ ...connections, [key]: { ...value, url: e.target.value } })}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder={`${key} URL`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
