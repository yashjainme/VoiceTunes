"use client";

import { FC } from "react";
import { Music, Users, BarChart2, ArrowRight } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import Button from "./Button";
import FeatureCard from "./FeatureCard";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const HomePage: FC = () => {
  const { status } = useSession();
  const router = useRouter();

  const features = [
    {
      Icon: Users,
      title: "Fan Engagement",
      description: "Boost interaction by letting your audience vote on the next track."
    },
    {
      Icon: BarChart2,
      title: "Real-time Analytics",
      description: "Get insights into your audience's music preferences and voting patterns."
    },
    {
      Icon: Music,
      title: "Diverse Playlists",
      description: "Create themed playlists and let fans vote on their favorites."
    }
  ];

  const handleGetStarted = () => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else {
      signIn("google", { callbackUrl: "/dashboard" });
    }
  };

  const handleLearnMore = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <Header />
      
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-48 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none" />
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-purple-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                  Let Your Fans Choose the Soundtrack
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl leading-relaxed">
                  Votetunes is the revolutionary music streaming platform where your audience decides what plays next. Upvote, downvote, and support with paid requests.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all duration-200"
                >
                  {status === "authenticated" ? "Go to Dashboard" : "Get Started Now"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLearnMore}
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 py-3 px-8 rounded-lg transition-all duration-200"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-16 md:py-28 bg-gray-900 scroll-mt-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-purple-450">
                Designed for Modern Content Creators
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Engage your community, monetize priority streams, and deliver a democratic listening experience.
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Refined CTA Section */}
        <section id="about" className="w-full py-20 bg-gray-800 scroll-mt-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-purple-400">
                  Ready to Let Your Fans Take Control?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl">
                  Join Votetunes today and revolutionize how your audience interacts with your music stream.
                </p>
              </div>

              <div className="w-full max-w-md">
                <Button 
                  onClick={handleGetStarted}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                >
                  {status === "authenticated" ? "Enter the Space" : "Sign Up with Google"}
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  By joining, you agree to our standard terms & conditions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;