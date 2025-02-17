import React from 'react';

const App = () => {
  return (
    <div className='min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12'>
      <div className='relative py-3 sm:max-w-xl sm:mx-auto'>
        <div className='relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20'>
          <div className='max-w-md mx-auto'>
            <h1 className='text-3xl font-bold text-blue-900 mb-4'>
              Hello React + Electron!
            </h1>
            <p className='text-gray-600'>This is my first Electron app.⚡️</p>
            <p className='text-rose-600'>Now using tailwindCSS.⚡️</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
