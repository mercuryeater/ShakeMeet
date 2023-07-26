import { Link } from 'react-router-dom';
import logoHand from '../../assets/handshake3.png';

function Header() {
  return (
    <header className="relative mb-10 flex items-center justify-between px-6 py-3">
      <div className="absolute  inset-0 -my-2 -mt-7 flex items-center justify-center bg-gray-400 opacity-20 blur-md" />
      <Link href="/">
        <div className="flex cursor-pointer items-center gap-3 hover:scale-105 active:scale-95 active:opacity-80">
          <img
            src={logoHand}
            alt="Generic Logo"
            className=" z-10 h-auto max-h-20 blur-none "
          />

          <h1 className="cursor-pointer text-6xl font-bold text-blue-200 sm:hidden">
            SM
          </h1>
          <h1 className="hidden cursor-pointer text-6xl font-bold text-blue-200 sm:block">
            ShakeMeet
          </h1>
        </div>
      </Link>

      <div className="z-10 flex items-center justify-between gap-3">
        <p className="cursor-pointer text-lg font-semibold text-blue-200 hover:text-blue-400 active:text-blue-600  ">
          Sign In
        </p>
        <p className="cursor-pointer text-lg  font-semibold text-blue-200 hover:text-blue-400 active:text-blue-600">
          About Us
        </p>
      </div>
    </header>
  );
}

export default Header;
