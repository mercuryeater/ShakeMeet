import { useRouteError } from 'react-router-dom';
import Header from '../components/Header/Header';

function NotFound() {
  const error = useRouteError();
  console.log('🚀 ~ file: NotFound.jsx:5 ~ NotFound ~ error:', error);
  return (
    <>
      <Header />
      <div className="mt-80 flex-col text-center text-5xl font-medium text-sky-100">
        <h1 className="text-8xl">{error.status}</h1>
        <h2>{error.data}</h2>
      </div>
    </>
  );
}

export default NotFound;
