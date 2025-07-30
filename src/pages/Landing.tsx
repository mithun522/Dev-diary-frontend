import { Link } from "react-router-dom";
import Button from "../components/ui/button";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  Book,
  BrainCircuit,
  Building2,
  ChartNoAxesCombined,
  Check,
  Code,
  Facebook,
  Instagram,
  Linkedin,
  Sparkle,
  Star,
  Twitter,
  X,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-300 dark:border-gray-700 shadow-sm fixed w-full bg-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M21 7 7.5 7"></path>
            <path d="M7.5 7 13 17"></path>
            <path d="M13 17 21 17"></path>
            <path d="M21 17 15.5 7"></path>
            <path d="M15.5 7 10 17"></path>
            <path d="M10 17 3 17"></path>
            <path d="M3 17 3 7"></path>
            <path d="M3 7 7.5 7"></path>
          </svg>
          <span className="text-xl font-bold">CodePrep Compass</span>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
          </nav>
          <ThemeToggle />
          <div className="flex gap-2">
            <Button variant="light" data-cy="login">
              <Link to="/auth/login">Login</Link>
            </Button>
            <Button data-cy="signup">
              <Link to="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center px-6 md:px-12 py-16 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Master Your Tech Interview Journey with{" "}
            <span className="text-primary">CodePrep Compass</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            The all-in-one platform for developers preparing for top-tier tech
            interviews. Track progress, practice coding, master system design,
            and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg">
              <Link to="/auth/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outlinePrimary">
              <a href="#features">Learn More</a>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Coding Problems</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">200+</div>
              <div className="text-muted-foreground">System Design Cases</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Top Companies Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Complete Interview Prep Suite
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to ace your next tech interview, all in one
              place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Code />
              </div>
              <h3 className="text-xl font-bold mb-2">DSA Tracker</h3>
              <p className="text-muted-foreground">
                Track your progress on 500+ coding problems organized by topic,
                difficulty, and company.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <BrainCircuit />
              </div>
              <h3 className="text-xl font-bold mb-2">Interview Simulator</h3>
              <p className="text-muted-foreground">
                Practice behavioral and technical interviews with our
                timer-based mock interview simulator.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Building2 />
              </div>
              <h3 className="text-xl font-bold mb-2">System Design Studio</h3>
              <p className="text-muted-foreground">
                Create, save, and study system design diagrams with our
                interactive design studio.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Book />
              </div>
              <h3 className="text-xl font-bold mb-2">Knowledge Base</h3>
              <p className="text-muted-foreground">
                Your personal space for notes, blog posts, and interview
                preparation materials.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <ChartNoAxesCombined />
              </div>
              <h3 className="text-xl font-bold mb-2">Progress Analytics</h3>
              <p className="text-muted-foreground">
                Track your improvement with detailed analytics, streaks, and
                personal insights.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Sparkle />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Recommendations</h3>
              <p className="text-muted-foreground">
                Get AI-powered recommendations on what to study next based on
                your progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 md:px-12 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See how CodePrep Compass has helped developers land their dream
              jobs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex gap-3">
                {" "}
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-amber-500 mb-4"
                  >
                    <Star fill="#f59e0b" color="#f59e0b" />
                  </div>
                ))}
              </div>
              <p className="mb-4">
                "I was struggling with system design interviews until I started
                using CodePrep Compass. After just 6 weeks, I landed a senior
                role at Amazon."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold">MJ</span>
                </div>
                <div>
                  <div className="font-medium">Michael Johnson</div>
                  <div className="text-sm text-muted-foreground">
                    Senior SDE @ Amazon
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex gap-3">
                {" "}
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-amber-500 mb-4"
                  >
                    <Star fill="#f59e0b" color="#f59e0b" />
                  </div>
                ))}
              </div>
              <p className="mb-4">
                "The DSA tracker helped me systematically work through hundreds
                of problems and track my progress. Perfect for busy
                professionals!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold">SP</span>
                </div>
                <div>
                  <div className="font-medium">Sarah Patel</div>
                  <div className="text-sm text-muted-foreground">
                    Frontend Engineer @ Google
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex gap-3">
                {" "}
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-amber-500 mb-4"
                  >
                    <Star fill="#f59e0b" color="#f59e0b" />
                  </div>
                ))}
              </div>
              <p className="mb-4">
                "The mock interview simulator with voice recording helped me
                improve my communication. The feedback was invaluable!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold">DL</span>
                </div>
                <div>
                  <div className="font-medium">David Lee</div>
                  <div className="text-sm text-muted-foreground">
                    Software Engineer @ Microsoft
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're a student or a professional, we have a plan that
              fits your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-card border rounded-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2">Basic</h3>
                <div className="text-3xl font-bold mb-2">Free</div>
                <p className="text-muted-foreground">Perfect for beginners</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Access to 100+ DSA problems</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Basic progress tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Knowledge base (limited)</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <X color="#FF5733" width={30} height={30} />
                  <span>Mock interviews</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <X color="#FF5733" width={30} height={30} />
                  <span>System design tools</span>
                </li>
              </ul>
              <Button className="w-full" variant="outlinePrimary">
                <Link to="/auth/signup">Sign Up Free</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-card border-2 border-primary rounded-lg p-6 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-2">
                  $19
                  <span className="text-lg font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
                <p className="text-muted-foreground">For serious candidates</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Access to all DSA problems</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Advanced progress analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Unlimited knowledge base</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>10 mock interviews per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>System design tools</span>
                </li>
              </ul>
              <Button className="w-full">
                <Link to="/auth/signup">Get Started</Link>
              </Button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-card border rounded-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-2">Enterprise</h3>
                <div className="text-3xl font-bold mb-2">
                  $49
                  <span className="text-lg font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
                <p className="text-muted-foreground">
                  For teams & professionals
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Everything in Pro plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Unlimited mock interviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Private team dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check color="#50C878" width={30} height={30} />
                  <span>Custom integrations</span>
                </li>
              </ul>
              <Button className="w-full" variant="outlinePrimary">
                <Link to="/auth/signup">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 bg-gray-100 text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Ace Your Next Interview?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who have landed their dream jobs with
            CodePrep Compass.
          </p>
          <Button size="lg" variant="success" className="min-w-[200px]">
            <Link to="/auth/signup">Start Your Journey</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-primary"
                >
                  <path d="M21 7 7.5 7"></path>
                  <path d="M7.5 7 13 17"></path>
                  <path d="M13 17 21 17"></path>
                  <path d="M21 17 15.5 7"></path>
                  <path d="M15.5 7 10 17"></path>
                  <path d="M10 17 3 17"></path>
                  <path d="M3 17 3 7"></path>
                  <path d="M3 7 7.5 7"></path>
                </svg>
                <span className="font-bold">CodePrep Compass</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your all-in-one platform for tech interview preparation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-muted-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CodePrep Compass. All rights
              reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                <Linkedin />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
