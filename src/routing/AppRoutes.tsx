import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from '../App';
import Investment from '../pages/Investment';
import Exercise from '../pages/Exercise';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="invest" element={<Investment />} />
          <Route path="exercise" element={<Exercise />} />
          <Route path="*" element={<Navigate to="/invest" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
