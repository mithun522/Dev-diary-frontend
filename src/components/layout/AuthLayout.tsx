import { ThemeToggle } from "../ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col bg-gray-100 p-10">
        <div className="flex items-center gap-2 mb-12">
          <span className="text-2xl font-bold text-primary">
            CodePrep Compass
          </span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold mb-6">
              Prepare for Tech Interviews
            </h1>
            <p className="text-muted-foreground mb-2">
              Track your DSA progress, practice system design, and prepare for
              behavioral interviews all in one place.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 items-center">
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <div className="font-bold text-xl mb-1">500+</div>
                <div className="text-sm text-muted-foreground">
                  Coding problems
                </div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <div className="font-bold text-xl mb-1">50+</div>
                <div className="text-sm text-muted-foreground">
                  System design templates
                </div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <div className="font-bold text-xl mb-1">100+</div>
                <div className="text-sm text-muted-foreground">
                  STAR questions
                </div>
              </div>
              <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                <div className="font-bold text-xl mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Progress tracking
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center mt-12">
          © {new Date().getFullYear()} CodePrep Compass. All rights reserved.
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="md:hidden flex justify-between items-center mb-8">
            <span className="text-xl font-bold">CodePrep Compass</span>
            <ThemeToggle />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
