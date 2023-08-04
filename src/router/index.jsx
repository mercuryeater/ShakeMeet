/* eslint-disable import/no-extraneous-dependencies */
import { createBrowserRouter } from 'react-router-dom';
import Root from '../layout/Root';
import Home from '../pages/Home';
import PeerToPeer from '../components/Call/Call';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  // Aqui dentro se crean las rutas
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/call',
        element: <PeerToPeer />,
      },
    ],
  },
]);

export default router;
