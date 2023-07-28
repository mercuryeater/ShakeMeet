import { Link } from 'react-router-dom';

function InputJoinCall({ joinCall, setRemoteCallID }) {
  const handleInputChange = (event) => {
    setRemoteCallID(event.target.value);
  };
  return (
    <div
      className="absolute inset-0 z-10  flex flex-col
    items-center justify-center gap-5 p-10 drop-shadow-lg backdrop-blur-sm"
    >
      <div className="flex ">
        <input
          type="text"
          className="rounded-l-2xl p-2 text-lg"
          onChange={handleInputChange}
        />
        <button
          type="button"
          className="rounded-r-2xl bg-gradient-to-b from-pink-300 via-purple-300 to-indigo-400 px-3
      py-2 text-lg font-semibold transition-all hover:scale-105 hover:text-gray-200 active:scale-100
      active:text-gray-400 active:opacity-80"
          onClick={() => joinCall()}
        >
          ANSWER CALL
        </button>
      </div>

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

export default InputJoinCall;
