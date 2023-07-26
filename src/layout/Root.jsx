// eslint-disable-next-line import/no-extraneous-dependencies
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';

function Root() {
  return (
    <>
      <Header />

      <Outlet />
    </>
  );
}

export default Root;
