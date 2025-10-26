import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

export const App = () => {
  return (
    <>
      <Header />
      <main className="container py-5">
        <div className="text-center">
          <h1>¡Bienvenido a Level-Up Gamer!</h1>
          <p className="lead">La migración a React está en progreso.</p>
        </div>
      </main>
      <Footer />
    </>
  );
};