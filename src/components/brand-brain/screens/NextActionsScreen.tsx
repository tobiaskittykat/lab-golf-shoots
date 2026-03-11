import { Rocket, Palette, Upload, Users, ArrowRight } from "lucide-react";

interface NextActionsScreenProps {
  onAction: (action: string) => void;
}

const NextActionsScreen = ({ onAction }: NextActionsScreenProps) => {
  const primaryActions = [
    {
      id: "campaign",
      icon: Rocket,
      title: "Generate my first campaign",
      description: "Create a complete campaign with visuals and copy",
      primary: true,
    },
    {
      id: "moodboard",
      icon: Palette,
      title: "Create a moodboard",
      description: "Explore visual directions for your brand",
      primary: true,
    },
    {
      id: "upload",
      icon: Upload,
      title: "Upload more brand inputs",
      description: "Add more assets to improve Brand Brain",
      primary: false,
    },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">What would you like to do first?</h1>
      <p className="text-muted-foreground mb-8">
        Your Brand Brain is trained and ready. Let's put it to work.
      </p>

      <div className="space-y-4 mb-8">
        {primaryActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-xl text-left transition-all duration-200 group ${
                action.primary
                  ? "bg-card border border-border hover:border-primary/50 hover:shadow-lg"
                  : "bg-secondary/50 border border-transparent hover:bg-secondary"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                action.primary ? "bg-primary/10" : "bg-secondary"
              }`}>
                <Icon className={`w-6 h-6 ${action.primary ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium group-hover:text-primary transition-colors">
                  {action.title}
                </p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          );
        })}
      </div>

      {/* Invite Team */}
      <div className="p-5 rounded-xl bg-secondary/30 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Invite your team</p>
              <p className="text-sm text-muted-foreground">Share Brand Brain access with colleagues</p>
            </div>
          </div>
          <button className="text-sm text-primary font-medium hover:underline">
            Invite →
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextActionsScreen;