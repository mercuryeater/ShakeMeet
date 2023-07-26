import { Link } from 'react-router-dom';

function StartCall() {
  return (
    <Link to="/call">
      <button
        type="button"
        className="rounded-2xl bg-teal-300 px-3 py-2 font-semibold hover:scale-105 hover:text-blue-400 active:scale-95 active:text-blue-600 active:opacity-80"
      >
        START CALL
      </button>
    </Link>
  );
}
export default StartCall;
