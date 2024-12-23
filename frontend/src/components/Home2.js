import React from "react";

const Home2 = () => {
  return (
    <div className="relative bg-white">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1557683316-973673baf926"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gray-500 mix-blend-multiply"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Get Fit & Healthy
        </h1>
        <p className="mt-6 text-xl text-gray-300 max-w-3xl">
          Join our program to maintain a healthy lifestyle. Get access to
          personalized training and diet plans tailored for you.
        </p>
        <div className="mt-10 max-w-xs">
          <a
            href="#"
            className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Join Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home2;
