import { IoSend } from 'react-icons/io5';
import { FormFloating } from '../components/common/FormFloating';
import { FormFloatingTextarea } from '../components/common/FormFloatingTextarea';

export const ContactPage = () => {
  return (
    <main className="d-flex align-items-center justify-content-center flex-grow-1 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7">
            <div className="form-signin">
              <form id="contact-form">
                <div className="text-center mb-4">
                  <a href="/">
                    <img
                      src="/img/logo.png"
                      alt="Logo Level-Up Gamer"
                      width="72"
                    />
                  </a>
                </div>
                <h1 className="h3 mb-3 fw-normal text-center">Contáctanos</h1>
                <p className="text-center mb-4 text-secondary">
                  Envíanos tus preguntas, comentarios o sugerencias. Te
                  responderemos a la brevedad.
                </p>

                <FormFloating
                  id="name"
                  name="name"
                  type="text"
                  label="Nombre"
                  placeholder="Tu nombre completo"
                  maxLength={100}
                  required
                />

                <FormFloating
                  id="email"
                  name="email"
                  type="email"
                  label="Correo Electrónico"
                  placeholder="tu.correo@ejemplo.com"
                  maxLength={100}
                  required
                />

                <FormFloatingTextarea
                  id="comment"
                  name="comment"
                  label="Mensaje"
                  placeholder="Escribe aquí tu mensaje..."
                  maxLength={500}
                  required
                  style={{ height: '120px' }}
                />

                <button className="btn btn-primary w-100 py-2 my-3" type="submit" aria-label="Enviar mensaje">
                  <IoSend size={24} />
                </button>

                <p className="mt-4 mb-3 text-secondary text-center">© 2025</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};