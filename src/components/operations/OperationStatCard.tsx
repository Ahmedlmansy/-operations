interface Props {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
}

export function OperationStatCard({ label, value, icon, iconColor }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconColor}/10 text-lg`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </div>
  );
}