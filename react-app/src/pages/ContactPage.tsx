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

                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Tu nombre completo"
                    maxLength={100}
                    required
                  />
                  <label htmlFor="name">Nombre</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="tu.correo@ejemplo.com"
                    maxLength={100}
                    required
                  />
                  <label htmlFor="email">Correo Electrónico</label>
                </div>

                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="comment"
                    name="comment"
                    placeholder="Escribe aquí tu mensaje..."
                    maxLength={500}
                    required
                    style={{ height: '120px' }}
                  ></textarea>
                  <label htmlFor="comment">Mensaje</label>
                </div>

                <button className="btn btn-primary w-100 py-2 my-3" type="submit">
                  Enviar Mensaje
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