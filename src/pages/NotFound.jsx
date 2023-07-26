import { useRouteError } from 'react-router-dom';

function NotFound() {
  const error = useRouteError();
  console.log('🚀 ~ file: NotFound.jsx:5 ~ NotFound ~ error:', error);
  return (
    <div className="mt-80 flex-col text-center text-5xl font-medium text-sky-100">
      <h1>Oops...</h1>
      <h2>{error.data}</h2>
      <h2>{error.status}</h2>
    </div>
  );
}

export default NotFound;
