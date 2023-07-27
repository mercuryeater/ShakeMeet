import { Link } from 'react-router-dom';

function StartCall() {
  return (
    <Link to="/call">
      <button
        type="button"
        className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
        px-3 py-2 font-semibold transition-all hover:scale-105 hover:text-blue-100 active:scale-95
        active:text-blue-300 active:opacity-80"
      >
        START CALL
      </button>
    </Link>
  );
}
export default StartCall;
