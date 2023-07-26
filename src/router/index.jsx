/* eslint-disable import/no-extraneous-dependencies */
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import PeerToPeer from '../components/PeerToPeer';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  // Aqui dentro se crean las rutas
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
  },
  {
    path: '/call',
    element: <PeerToPeer />,
    errorElement: <NotFound />,
  },
  {
    path: '/about',
    element: <h1>Esto es about</h1>,
    errorElement: <NotFound />,
  },
  {
    path: '/about',
    element: <h1>Esto es about</h1>,
    errorElement: <NotFound />,
  },
]);

export default router;
