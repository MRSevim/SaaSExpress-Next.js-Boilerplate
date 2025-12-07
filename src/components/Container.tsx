import { cn } from "@/utils/helpers";

const Container = ({
  children,
  className,
  isMain = true,
}: {
  children: React.ReactNode;
  className?: string;
  isMain?: boolean;
}) => {
  if (isMain) {
    return (
      <main
        className={cn(
          "mx-auto px-4 max-w-7xl flex-1 w-full mt-20 flex justify-center items-start",
          className ? className : "",
        )}
      >
        {children}
      </main>
    );
  } else {
    return (
      <div className={cn("mx-auto px-4 max-w-7xl", className ? className : "")}>
        {children}
      </div>
    );
  }
};

export default Container;
