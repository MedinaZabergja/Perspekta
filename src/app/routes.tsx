import { createBrowserRouter } from 'react-router';
import RootLayout from './pages/RootLayout';
import HomePage from './pages/HomePage';
import ReflectPage from './pages/ReflectPage';
import HistoryPage from './pages/HistoryPage';
import FearJarPage from './pages/FearJarPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'reflect', Component: ReflectPage },
      { path: 'history', Component: HistoryPage },
      { path: 'fear-jar', Component: FearJarPage },
      { path: '*', Component: HomePage }, // Fallback to home for unknown routes
    ],
  },
]);
