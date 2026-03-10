// Stub - BrandSection component
import { RefObject } from "react";

interface BrandSectionProps {
  brandRef: RefObject<HTMLDivElement>;
}

const BrandSection = ({ brandRef }: BrandSectionProps) => {
  return (
    <section ref={brandRef} className="px-8 py-16 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-12">
          <h2 className="font-display text-2xl font-bold mb-2">Brand Identity</h2>
          <p className="text-muted-foreground">Your brand assets and guidelines will appear here</p>
        </div>
      </div>
    </section>
  );
};

export default BrandSection;
