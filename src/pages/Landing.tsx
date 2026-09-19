import { Link } from "react-router-dom";
import Button from "../components/ui/button";
import { ThemeToggle } from "../components/ThemeToggle";
import Seo from "../components/Seo";
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
  Twitter,
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Placement-Ready DSA & Interview Prep for Training Institutes"
        path="/"
      />
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
          <span className="text-xl font-bold">Dev Diary</span>
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
              For Institutes
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pilot Program
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
          <div className="inline-block mx-auto bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full">
            Now onboarding a limited number of training institutes for a free pilot
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Placement-Ready DSA &amp; Interview Prep for{" "}
            <span className="text-primary">Your Students</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Give your students structured coding practice, mock interviews, and
            progress tracking under your institute's own admin console &mdash;
            free during our pilot phase.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button size="lg">
              <a href="mailto:edusphere@eduspheresolutions.com?subject=Free%20Pilot%20Request%20-%20Dev%20Diary">
                Request Free Pilot Access
              </a>
            </Button>
            <Button size="lg" variant="outlinePrimary">
              <a href="#features">See What's Included</a>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Coding Problems</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Company-Tagged Interview Sets</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary">Free</div>
              <div className="text-muted-foreground">For Pilot Institutes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Everything Your Placement Cell Needs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A single platform your faculty can manage and your students can
              practice on &mdash; from first-year fundamentals to final-round
              mock interviews.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Code />
              </div>
              <h3 className="text-xl font-bold mb-2">DSA Prep</h3>
              <p className="text-muted-foreground">
                500+ coding problems organized by topic and difficulty, with a
                built-in code editor so students can practice without leaving
                the platform.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <BrainCircuit />
              </div>
              <h3 className="text-xl font-bold mb-2">Interview Simulator</h3>
              <p className="text-muted-foreground">
                Company-tagged behavioral and technical mock interviews with
                recording, so students can review and improve their delivery.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Building2 />
              </div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                Admin Console
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  For Faculty
                </span>
              </h3>
              <p className="text-muted-foreground">
                Invite your students, curate what content they see, and manage
                everything from a dedicated institute admin dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Book />
              </div>
              <h3 className="text-xl font-bold mb-2">Knowledge Base</h3>
              <p className="text-muted-foreground">
                A shared space for notes, blog posts, and reference material
                your faculty can curate for the whole batch.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <ChartNoAxesCombined />
              </div>
              <h3 className="text-xl font-bold mb-2">Progress Analytics</h3>
              <p className="text-muted-foreground">
                See exactly where each student stands &mdash; problems solved,
                streaks, and mock interview activity.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-card border rounded-lg p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Sparkle />
              </div>
              <h3 className="text-xl font-bold mb-2">Topic Recommendations</h3>
              <p className="text-muted-foreground">
                Highlights weak topics and what to practice next, based on each
                student's own activity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Institutes */}
      <section id="testimonials" className="py-20 px-6 md:px-12 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Institutes Are Partnering With Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're currently working closely with a small number of pilot
              institutes to build this around real classroom and placement
              needs &mdash; not guesswork.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-lg p-6">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Sparkle />
              </div>
              <h3 className="text-lg font-semibold mb-2">Free During the Pilot</h3>
              <p className="text-muted-foreground">
                No cost, no commitment. We're onboarding a handful of institutes
                to test this with real students before it's a paid product.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <Building2 />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your Faculty Stays in Control</h3>
              <p className="text-muted-foreground">
                Admins invite students and see progress across the batch, while
                each student practices on their own account.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full text-primary">
                <ChartNoAxesCombined />
              </div>
              <h3 className="text-lg font-semibold mb-2">Built From Your Feedback</h3>
              <p className="text-muted-foreground">
                Features like bulk roster upload, batch cohorts, and
                certificates are being built next, driven directly by what
                pilot institutes ask for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Program */}
      <section id="pricing" className="py-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border-2 border-primary rounded-lg p-8 md:p-12 text-center">
            <div className="inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium mb-6">
              Free Pilot Program
            </div>
            <h2 className="text-3xl font-bold mb-4">
              Free for Your First Batch of Students
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              We're onboarding a small number of training institutes and
              colleges at no cost. In exchange, we ask for honest feedback from
              your students and faculty as we build out the next set of
              features &mdash; bulk roster upload, batch/cohort management,
              certificates, and placement tracking.
            </p>
            <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <Check color="#50C878" width={24} height={24} />
                <span>Full access to DSA prep, interview simulator &amp; analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check color="#50C878" width={24} height={24} />
                <span>A dedicated admin account for your institute</span>
              </li>
              <li className="flex items-center gap-2">
                <Check color="#50C878" width={24} height={24} />
                <span>No cost, no card required</span>
              </li>
              <li className="flex items-center gap-2">
                <Check color="#50C878" width={24} height={24} />
                <span>Direct input into what we build next</span>
              </li>
            </ul>
            <Button size="lg" className="min-w-[240px]">
              <a href="mailto:edusphere@eduspheresolutions.com?subject=Free%20Pilot%20Request%20-%20Dev%20Diary">
                Request Free Pilot Access
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 bg-gray-100 text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bring Placement-Ready Prep to Your Campus
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Free for pilot institutes &mdash; help us shape the product your
            students actually need.
          </p>
          <Button size="lg" variant="success" className="min-w-[200px]">
            <a href="mailto:edusphere@eduspheresolutions.com?subject=Free%20Pilot%20Request%20-%20Dev%20Diary">
              Request Free Pilot Access
            </a>
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
                <span className="font-bold">Dev Diary</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Placement-ready DSA and interview prep for training institutes
                and colleges.
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
              © {new Date().getFullYear()} Dev Diary. All rights reserved.
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
