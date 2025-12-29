'use client';

import dynamic from 'next/dynamic';


const Editor = dynamic(() => import('@/components/FlowEditor/Editor'), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

const Home = () => {
  return (
    <div className="w-full h-screen bg-gray-100">

      <Editor />
    </div>
  );
}

export default Home;


