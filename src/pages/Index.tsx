
import ContributionBoard from '../components/ContributionBoard';
import TypewriterText from '../components/TypewriterText';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-50"></div>
      
      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Contribution Board */}
        <div className="mb-12">
          <ContributionBoard />
        </div>
        
        {/* Animated Text */}
        <div className="space-y-4">
          <TypewriterText 
            text="Don't just contribute... make a difference" 
            delay={1000}
            className="text-3xl md:text-5xl font-bold text-gray-300"
            loop={true}
            loopDelay={10000}
          />
        </div>
        
        {/* New call to action text */}
        <div className="mt-16">
          <TypewriterText 
            text="All of your contributions can make a difference" 
            delay={4000}
            className="text-lg md:text-xl text-gray-400 font-light"
            loop={true}
            loopDelay={10000}
          />
        </div>
      </div>
      
      {/* Subtle decorative elements */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-green-400 rounded-full opacity-30 animate-pulse"></div>
      <div className="absolute top-32 right-20 w-1 h-1 bg-green-500 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-green-300 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};

export default Index;
