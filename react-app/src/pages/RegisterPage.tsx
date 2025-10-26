import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Interfaces para la data de la API
interface Region {
  codigo: string;
  nombre: string;
}

interface Commune {
  codigo: string;
  nombre: string;
}

export const RegisterPage = () => {
  const navigate = useNavigate();

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    run: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    address: '',
    region: '',
    commune: ''
  });

  // Estados para las listas de la API
  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  // Cargar regiones al montar el componente
  useEffect(() => {
    fetch('https://apis.digital.gob.cl/dpa/regiones')
      .then(response => response.json())
      .then((data: Region[]) => setRegions(data))
      .catch(error => console.error('Error fetching regions:', error));
  }, []);

  // Cargar comunas cuando cambia la región
  useEffect(() => {
    if (formData.region) {
      setLoadingCommunes(true);
      fetch(`https://apis.digital.gob.cl/dpa/regiones/${formData.region}/comunas`)
        .then(response => response.json())
        .then((data: Commune[]) => {
          setCommunes(data);
          setLoadingCommunes(false);
        })
        .catch(error => {
          console.error('Error fetching communes:', error);
          setLoadingCommunes(false);
        });
    }
  }, [formData.region]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí iría la lógica de validación completa
    if (formData.password !== formData.confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }
    // ... resto de validaciones

    alert('Registro exitoso (simulado).');
    navigate('/login');
  };

  return (
    <main className="d-flex align-items-center justify-content-center flex-grow-1 py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-7 col-xl-6">
            <div className="form-signin">
              <form id="register-form" onSubmit={handleSubmit}>
                <div className="logo-container text-center mb-3">
                  <Link to="/">
                    <img className="logo-img" src="/img/logo.png" alt="Logo Level-Up Gamer" />
                  </Link>
                </div>
                <h1 className="h3 mb-3 fw-normal text-center">Crea una Cuenta</h1>

                {/* Campos del formulario */}
                <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="name" name="name" placeholder="Nombre" required onChange={handleChange} value={formData.name} />
                  <label htmlFor="name">Nombre</label>
                </div>
                <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="lastName" name="lastName" placeholder="Apellidos" required onChange={handleChange} value={formData.lastName} />
                  <label htmlFor="lastName">Apellidos</label>
                </div>
                <div className="form-floating mb-3">
                  <input type="email" className="form-control" id="email" name="email" placeholder="name@example.com" required onChange={handleChange} value={formData.email} />
                  <label htmlFor="email">Correo Electrónico</label>
                </div>
                <div className="form-floating mb-3">
                  <input type="password" className="form-control" id="password" name="password" placeholder="Contraseña" required onChange={handleChange} value={formData.password} />
                  <label htmlFor="password">Contraseña</label>
                </div>
                <div className="form-floating mb-3">
                  <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirmar Contraseña" required onChange={handleChange} value={formData.confirmPassword} />
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                </div>
                
                {/* Selectores de Región y Comuna */}
                <div className="form-floating mb-3">
                  <select className="form-select" id="region" name="region" required onChange={handleChange} value={formData.region}>
                    <option value="">Seleccione Región</option>
                    {regions.map(r => <option key={r.codigo} value={r.codigo}>{r.nombre}</option>)}
                  </select>
                  <label htmlFor="region">Región</label>
                </div>
                <div className="form-floating mb-3">
                  <select className="form-select" id="commune" name="commune" required onChange={handleChange} value={formData.commune} disabled={!formData.region || loadingCommunes}>
                    <option value="">Seleccione Comuna</option>
                    {communes.map(c => <option key={c.codigo} value={c.codigo}>{c.nombre}</option>)}
                  </select>
                  <label htmlFor="commune">Comuna</label>
                </div>

                <button className="btn btn-primary w-100 py-2 my-3" type="submit">Registrarse</button>

                <p className="mt-4 text-center">
                  ¿Ya tienes una cuenta?
                  <Link to="/login" className="text-primary">Inicia sesión aquí</Link>
                </p>
                <p className="mt-4 mb-3 text-body-secondary text-center">© 2025</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};