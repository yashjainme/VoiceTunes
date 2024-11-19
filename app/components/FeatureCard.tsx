import { FC } from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <Icon className="h-12 w-12 text-purple-500" />
      <h2 className="text-2xl font-bold text-purple-400">{title}</h2>
      <p className="max-w-[300px] text-gray-400">{description}</p>
    </div>
  );
};

export default FeatureCard;