/* eslint-disable import/no-extraneous-dependencies */
import { createBrowserRouter } from 'react-router-dom';
import Root from '../layout/Root';
import App from '../App';
import PeerToPeer from '../components/PeerToPeer';
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
        element: <App />,
      },
      {
        path: '/call',
        element: <PeerToPeer />,
      },
      // {
      //   path: '/about',
      //   element: <App />,
      // },
    ],
  },
]);

export default router;
