import { Link } from 'react-router-dom';

function InitiateCall({ createCall }) {
  return (
    <div
      className="fixed inset-0 z-50  flex h-screen flex-col
      items-center justify-center gap-5 p-10 drop-shadow-lg backdrop-blur-sm"
    >
      <button
        type="button"
        className="rounded-2xl bg-gradient-to-b from-pink-300 via-purple-300 to-indigo-400 px-3
        py-2 text-lg font-semibold transition-all hover:scale-105 hover:text-gray-200 active:scale-95
        active:text-gray-400 active:opacity-80"
        onClick={() => {
          createCall();
        }}
      >
        CALL
      </button>
      <h1 className="text-xl text-sky-100">or</h1>
      <Link to="/">
        <button
          type="button"
          className="rounded-2xl bg-gradient-to-l from-sky-300 to-indigo-400 px-3
        py-2 text-base font-medium transition-all hover:scale-105 hover:text-gray-200 active:scale-95
        active:text-gray-700 active:opacity-80"
        >
          BACK
        </button>
      </Link>
    </div>
  );
}

export default InitiateCall;
