export const AboutPage = () => {
  return (
    <main>
      <div className="container mt-5">
        <section className="p-5 mb-4 rounded-3 about-us-section">
          <div className="container-fluid py-5">
            <h1 className="display-5 fw-bold">Acerca de Nosotros</h1>
            <p className="col-md-8 fs-4">
              Level-Up Gamer es una tienda online dedicada a satisfacer las
              necesidades de los entusiastas de los videojuegos en Chile.
              Lanzada hace dos años como respuesta a la creciente demanda
              durante la pandemia.
            </p>
          </div>
        </section>
        <section
          id="nuestra-historia"
          className="row featurette d-flex align-items-center mb-5"
        >
          <div className="col-md-7">
            <h2 className="featurette-heading">Nuestra Historia</h2>
            <p className="lead">
              La historia de Level-Up Gamer comenzó hace dos años, en respuesta
              a la creciente necesidad de equipos de videojuegos de calidad
              durante la pandemia. Al darnos cuenta de que el mercado chileno
              carecía de opciones accesibles, un grupo de amigos apasionados por
              el gaming decidimos crear nuestra propia solución. Así nació
              Level-Up Gamer, una tienda online construida sobre la pasión y el
              compromiso de ofrecer una amplia gama de productos—desde consolas
              y accesorios hasta PCs y sillas especializadas—con envíos a todo
              Chile. Aunque no tenemos una tienda física, nuestra misión es
              sencilla: democratizar el acceso al gaming de calidad y seguir
              creciendo junto a nuestra comunidad de jugadores.
            </p>
          </div>
          <div className="col-md-5">
            <img
              src="/img/logo.png"
              alt="Logo de Level-Up Gamer"
              className="img-fluid rounded"
            />
          </div>
        </section>

        <hr className="my-5" />

        <section className="text-center mb-5">
          <h2>Conoce a nuestro equipo</h2>
          <p className="lead">
            Nuestro éxito se basa en el talento y la dedicación de nuestra
            gente.
          </p>
        </section>

        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="team-member text-center">
              <img
                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGVyc29uYXxlbnwwfHwwfHx8MA%3D%3D"
                alt="Matías Gutiérrez - CEO & Fundador"
                className="img-fluid"
              />
              <h4>Matías Gutiérrez</h4>
              <p>CEO & Fundador</p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="team-member text-center">
              <img
                src="https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBlcnNvbmF8ZW58MHx8MHx8fDA%3D"
                alt="Victor Mena - Lead Developer"
                className="img-fluid"
              />
              <h4>Victor Mena</h4>
              <p>Lead Developer</p>
            </div>
          </div>
          <div className="col-lg-4 col-md-12 mb-4">
            <div className="team-member text-center">
              <img
                src="https://plus.unsplash.com/premium_photo-1689568158814-3b8e9c1a9618?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGVyc29uYXxlbnwwfHwwfHx8MA%3D%3D"
                alt="David Larenas - Marketing Director"
                className="img-fluid"
              />
              <h4>David Larenas</h4>
              <p>Marketing Director</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};