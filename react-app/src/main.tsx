import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const Placeholder = () => <div>Welcome to the React App!</div>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Placeholder />
  </StrictMode>,
);
