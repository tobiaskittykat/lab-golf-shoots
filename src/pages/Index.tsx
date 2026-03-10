import { Camera, FolderOpen, Image } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">
          LAB Golf
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Product Shoots
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/gallery"
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-card-foreground transition-colors hover:bg-secondary"
          >
            <Image className="h-8 w-8 text-accent" />
            <span className="text-sm font-medium">Gallery</span>
          </Link>

          <Link
            to="/shoots"
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-card-foreground transition-colors hover:bg-secondary"
          >
            <Camera className="h-8 w-8 text-accent" />
            <span className="text-sm font-medium">Shoots</span>
          </Link>

          <Link
            to="/assets"
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 text-card-foreground transition-colors hover:bg-secondary"
          >
            <FolderOpen className="h-8 w-8 text-accent" />
            <span className="text-sm font-medium">Assets</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
