// eslint-disable-next-line import/no-extraneous-dependencies
import { Outlet, useNavigation } from 'react-router-dom';
import Header from '../components/Header/Header';

function Root() {
  const navigation = useNavigation();
  return (
    <>
      <Header />
      {navigation.state === 'loading' ? 'Loading...' : <Outlet />}
    </>
  );
}

export default Root;
