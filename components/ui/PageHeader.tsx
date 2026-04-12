import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  rightContent,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        
        {icon && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 shadow-sm">
            {icon}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightContent && (
        <div className="text-sm text-gray-500">
          {rightContent}
        </div>
      )}
    </div>
  );
}