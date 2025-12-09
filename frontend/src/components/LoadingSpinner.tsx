"use client";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ message = "Loading...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin`}></div>
      {message && (
        <p className="text-gray-600 dark:text-gray-300 text-sm">{message}</p>
      )}
    </div>
  );
}

