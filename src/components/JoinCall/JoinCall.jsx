import { Link } from 'react-router-dom';

function JoinCall() {
  return (
    <Link to="/call">
      <button
        type="button"
        className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500
        px-3 py-2 font-semibold transition-all hover:scale-105
        hover:text-blue-100 active:scale-95
        active:text-blue-600 active:opacity-80"
        onClick={() => {
          localStorage.setItem('role', 'callee');
        }}
      >
        JOIN CALL
      </button>
    </Link>
  );
}
export default JoinCall;
