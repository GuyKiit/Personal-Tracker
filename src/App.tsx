import { Outlet } from 'react-router-dom';
import MasterLayout from './layout';

function App() {
  return (
    <MasterLayout>
      <Outlet />
    </MasterLayout>
  );
}

export default App;
