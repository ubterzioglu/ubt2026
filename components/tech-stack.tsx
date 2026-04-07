import type { StackGroup } from "@/types/site";

interface TechStackProps {
  stackGroups: StackGroup[];
}

export function TechStack({ stackGroups }: TechStackProps) {
  const colors = [
    "bg-blue-100 text-blue-800", // Automation & Frameworks
    "bg-red-100 text-red-800",   // Programming Languages  
    "bg-yellow-100 text-yellow-800", // API & Integration Testing
    "bg-green-100 text-green-800",  // CI/CD & Tooling
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-display font-bold text-ink mb-2">Tech Stack</h2>
        <p className="text-lg text-ink/70">Tools and technologies I work with daily</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stackGroups.map((group, index) => (
          <div key={group.title} className="bg-white rounded-2xl p-6 shadow-sm border border-line/20">
            <div className={`rounded-lg p-3 mb-4 ${colors[index]}`}>
              <h3 className="font-semibold text-lg">{group.title}</h3>
            </div>
            <div className="space-y-2">
              {group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="inline-block px-3 py-1 bg-mist rounded-lg text-sm text-ink/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}