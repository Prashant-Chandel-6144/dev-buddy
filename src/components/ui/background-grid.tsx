import { cn } from "@/lib/utils";

export const BackgroundGrid = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-background dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] dark:bg-[size:10%_100%]",
        className
      )}
    />
  );
};
