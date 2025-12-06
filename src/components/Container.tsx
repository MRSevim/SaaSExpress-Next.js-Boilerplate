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
        className={`mx-auto px-4 max-w-7xl flex-1 w-full ${className ? className : ""}`}
      >
        {children}
      </main>
    );
  } else {
    return (
      <div className={`mx-auto px-4 max-w-7xl ${className ? className : ""}`}>
        {children}
      </div>
    );
  }
};

export default Container;
