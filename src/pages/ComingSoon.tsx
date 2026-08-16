import { useEffect, useState } from "react";

const ComingSoon = () => {

    const countdownDate = new Date("2026-05-31T00:00:00").getTime() + 5 * 24 * 60 * 60 * 1000;

    const [timeLeft, setTimeLeft] = useState({
        days: countdownDate ? Math.floor((countdownDate - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
        hours: countdownDate ? Math.floor((countdownDate - new Date().getTime()) % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)) : 0,
        minutes: countdownDate ? Math.floor((countdownDate - new Date().getTime()) % (1000 * 60 * 60) / (1000 * 60)) : 0,
        seconds: countdownDate ? Math.floor((countdownDate - new Date().getTime()) % (1000 * 60) / 1000) : 0,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            if (distance < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [countdownDate]);

  return (
    <>
  <div className="max-w-7xl w-full mx-auto" data-cy="coming-soon">

    {/* Main Content */}
    <div className="bg-white border border-gray-300 p-8 md:p-12 lg:p-16">
      {/* Logo/Brand */}
      <div className="flex justify-center mb-10">
        <div className="bg-black text-white font-bold text-xl md:text-2xl px-6 py-3">
          Dev Diary
        </div>
      </div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          COMING{" "}
          <span className="bg-black text-white px-2">SOON</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
          We're crafting something extraordinary. Stay tuned for our launch.
        </p>
      </div>
      {/* Countdown Timer */}
      <div className="flex justify-center mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md">
          <div className="bg-gray-100 border border-gray-300 p-4 text-center">
            <div className="text-3xl font-bold">{timeLeft.days}</div>
            <div className="text-sm text-gray-600">Days</div>
          </div>
          <div className="bg-gray-100 border border-gray-300 p-4 text-center">
            <div className="text-3xl font-bold">{timeLeft.hours}</div>
            <div className="text-sm text-gray-600">Hours</div>
          </div>
          <div className="bg-gray-100 border border-gray-300 p-4 text-center">
            <div className="text-3xl font-bold">{timeLeft.minutes}</div>
            <div className="text-sm text-gray-600">Minutes</div>
          </div>
          <div className="bg-gray-100 border border-gray-300 p-4 text-center">
            <div className="text-3xl font-bold">{timeLeft.seconds}</div>
            <div className="text-sm text-gray-600">Seconds</div>
          </div>
        </div>
      </div>
      {/* Divider */}
      <div className="border-t border-gray-300 my-12" />
      {/* Email Subscription */}
      <div className="max-w-lg mx-auto mb-12">
        <p className="text-center text-gray-700 mb-4">
          Get notified when we launch
        </p>
        <div className="flex flex-col sm:flex-row gap-0 sm:gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-grow px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
          />
          <button className="bg-black text-white font-medium px-6 py-3 border border-black hover:bg-gray-800 transition-colors duration-300 mt-2 sm:mt-0">
            Notify Me
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-3">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
      {/* Footer */}
      <div className="text-center text-gray-600 text-sm">
        <p>© 2026 Dev Diary. ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  </div>
</>

  );
};

export default ComingSoon;
