import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Augment the global Window interface for JSONP callbacks
declare global {
  interface Window {
    [key: string]: unknown;
  }
}

// Helper functions de validación
const validateEmail = (email: string) => {
    if (!email) return false;
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) return false;
    const allowedDomains = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
    return allowedDomains.some(domain => email.endsWith(domain));
};
const validateAge = (birthdateString: string) => {
    if (!birthdateString) return false;
    const birthdate = new Date(birthdateString);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const m = today.getMonth() - birthdate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
        age--;
    }
    return age >= 18;
};
const validateRun = (run: string) => {
    if (!run) return false;
    run = run.replace(/[^0-9kK]/g, '').toUpperCase();
    if (!/^([0-9]{7,8})([0-9K])$/.test(run)) return false;
    const cuerpo = run.slice(0, -1);
    const dv = run.slice(-1);
    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplo;
        if (multiplo < 7) {
            multiplo++;
        } else {
            multiplo = 2;
        }
    }
    let dvEsperado = 11 - (suma % 11);
    if (dvEsperado === 11) {
        dvEsperado = 0;
    } else if (dvEsperado === 10) {
        dvEsperado = 'K'.charCodeAt(0);
    }
    return dv === String.fromCharCode(dvEsperado as number);
};
const validateLength = (value: string, min: number, max: number) => {
    if (!value) return false;
    return value.length >= min && value.length <= max;
};

// Interfaces para la data de la API
interface Region {
  codigo: string;
  nombre: string;
}
interface Commune {
  codigo: string;
  nombre: string;
}

// Helper para realizar peticiones JSONP de forma genérica
const loadJSONP = <T,>(url: string, callback: (data: T) => void) => {
  const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
  window[callbackName] = (data: T) => {
    delete window[callbackName];
    document.body.removeChild(script);
    callback(data);
  };

  const script = document.createElement('script');
  script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
  document.body.appendChild(script);
};

export const RegisterPage = () => {
  const navigate = useNavigate();

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

  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  useEffect(() => {
    loadJSONP<Region[]>('https://apis.digital.gob.cl/dpa/regiones', (data) => {
      setRegions(data);
    });
  }, []);

  useEffect(() => {
    if (formData.region) {
      setLoadingCommunes(true);
      setCommunes([]);
      setFormData(prev => ({ ...prev, commune: '' }));
      loadJSONP<Commune[]>(`https://apis.digital.gob.cl/dpa/regiones/${formData.region}/comunas`, (data) => {
        setCommunes(data);
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
    
    if (!validateLength(formData.name, 1, 50)) {
        alert('El nombre es requerido y no debe exceder los 50 caracteres.');
        return;
    }
    if (!validateLength(formData.lastName, 1, 100)) {
        alert('Los apellidos son requeridos y no deben exceder los 100 caracteres.');
        return;
    }
    if (!validateRun(formData.run)) {
        alert('El RUN ingresado no es válido.');
        return;
    }
    if (!validateEmail(formData.email)) {
        alert('Correo inválido. Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com.');
        return;
    }
    if (!validateLength(formData.password, 4, 10)) {
        alert('La contraseña debe tener entre 4 y 10 caracteres.');
        return;
    }
    if (formData.password !== formData.confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }
    if (!validateAge(formData.birthdate)) {
        alert('Debes ser mayor de 18 años para registrarte.');
        return;
    }
    if (!formData.region) {
        alert('Debe seleccionar una región.');
        return;
    }
    if (!formData.commune) {
        alert('Debe seleccionar una comuna.');
        return;
    }
    if (!validateLength(formData.address, 1, 300)) {
        alert('La dirección es requerida y no debe exceder los 300 caracteres.');
        return;
    }

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
                    <img className="logo-img" src="/img/logo.png" alt="Logo Level-Up Gamer" width="72" />
                  </Link>
                </div>
                <h1 className="h3 mb-3 fw-normal text-center">Crea una Cuenta</h1>

                <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="name" name="name" placeholder="Nombre" required onChange={handleChange} value={formData.name} />
                  <label htmlFor="name">Nombre</label>
                </div>
                <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="lastName" name="lastName" placeholder="Apellidos" required onChange={handleChange} value={formData.lastName} />
                  <label htmlFor="lastName">Apellidos</label>
                </div>
                 <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="run" name="run" placeholder="RUN" required onChange={handleChange} value={formData.run} />
                  <label htmlFor="run">RUN</label>
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
                 <div className="form-floating mb-3">
                  <input type="date" className="form-control" id="birthdate" name="birthdate" required onChange={handleChange} value={formData.birthdate} />
                  <label htmlFor="birthdate">Fecha de Nacimiento</label>
                </div>
                 <div className="form-floating mb-3">
                  <input type="text" className="form-control" id="address" name="address" placeholder="Dirección" required onChange={handleChange} value={formData.address} />
                  <label htmlFor="address">Dirección</label>
                </div>
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