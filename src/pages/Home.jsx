import { useEffect } from 'react';
import StartCall from '../components/StartCall/StartCall';
import JoinCall from '../components/JoinCall/JoinCall';

function App() {
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div className="flex flex-col gap-16 p-5 md:flex-row md:gap-4">
      <h1 className="m-10 w-fit text-center text-8xl font-bold text-sky-100 md:w-3/5">
        <span
          className="bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text
        text-transparent sm:text-end"
        >
          SAY HI!{' '}
        </span>
        EASY CALLS NOW!
      </h1>
      <div className="flex h-64 flex-col items-center justify-evenly md:h-auto md:w-2/5">
        <StartCall />
        <h2 className="text-3xl text-sky-100">Or...</h2>
        <JoinCall />
      </div>
    </div>
  );
}

export default App;
