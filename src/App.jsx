import StartCall from './components/StartCall/StartCall';

function App() {
  return (
    <div className="p-5 md:flex md:justify-center md:gap-4">
      <h1 className="m-10 max-w-lg text-8xl font-bold text-sky-100">
        SAY HI! EASY CALLS NOW!
      </h1>
      <div className="flex w-full flex-col items-center justify-evenly">
        <StartCall />
        <h2 className="text-3xl text-sky-100">Or...</h2>
        <StartCall />
      </div>
    </div>
  );
}

export default App;
