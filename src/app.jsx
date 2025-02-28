import React from 'react';
import RootNav from './Navigation/RootNav';
const App = () => {
  return (
    <div className='min-h-screen'>
      <main className='max-w-7xl mx-auto py-0 sm:px-2 lg:px-0'>
        {/* <h1 className='text-2xl font-bold text-white p-4'>Trading Dashboard</h1> */}
        <RootNav />
      </main>
    </div>
  );
};

export default App;
