// /src/components/App.jsx
import { LoadingProvider } from '../components/LoadingContext';
import LoadingScreen from '../components/LoadingScreen';
import { RouterProvider } from 'react-router-dom';
import router from '../router';

const App = () => {
  return (
    <LoadingProvider>
      <LoadingScreen />
      <RouterProvider router={router} />
    </LoadingProvider>
  );
};

export default App;
