import { FC } from "react";
import { Music, Users, BarChart2, ArrowRight } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import Button from "./Button";
import Input from "./Input";
import FeatureCard from "./FeatureCard";
import { Redirect } from "./Redirect";

const HomePage: FC = () => {
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <Redirect/>
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-purple-400">
                  Let Your Fans Choose the Soundtrack
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Votetunes is the revolutionary music streaming platform where your audience decides what plays next.
                </p>
              </div>
              <div className="space-x-4">
                <Button>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </section>

        {/* Refined CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gray-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-purple-400">
                  Ready to Let Your Fans Take Control?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-400 md:text-xl">
                  Join Votetunes today and revolutionize how your audience interacts with your music.
                </p>
              </div>

              <div className="w-full max-w-md space-y-3">
                <form className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    placeholder="Enter your email" 
                    type="email"
                    className="flex-1"
                  />
                  <Button type="submit" className="whitespace-nowrap">
                    Join Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-gray-400 text-center">
                  By signing up, you agree to our Terms & Conditions.
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