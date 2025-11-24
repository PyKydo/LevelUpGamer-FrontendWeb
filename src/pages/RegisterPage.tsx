import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  validateEmail,
  validateAge,
  validateRun,
  validateLength,
  validatePassword,
} from '../helpers/validation.helper';
import { getRegions, getCommunesByRegion, type Region, type Commune, } from '../helpers/api.helper';
import { useNotification } from '../hooks/useNotification';
import { getLocalStorageItem, setLocalStorageItem } from '../helpers/storage.helper';
import { simpleHash } from '../helpers/security.helper';
import type { UserWithPassword } from '../hooks/AuthContext';
import { FormFloating } from '../components/common/FormFloating';
import { FormSelect } from '../components/common/FormSelect';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

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
    commune: '',
  });

  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const data = await getRegions();
        setRegions(data);
      } catch (error) {
        console.error('No se ha podido obtener la región:', error);
        showNotification('Error al cargar las regiones.', 'error');
      }
    };
    fetchRegions();
  }, [showNotification]);

  useEffect(() => {
    if (formData.region) {
      const fetchCommunes = async () => {
        setLoadingCommunes(true);
        setCommunes([]);
        setFormData((prev) => ({ ...prev, commune: '' }));
        try {
          const data = await getCommunesByRegion(formData.region);
          setCommunes(data);
        } catch (error) {
          console.error('No se ha podido obtener las comunas:', error);
          showNotification('Error al cargar las comunas.', 'error');
        } finally {
          setLoadingCommunes(false);
        }
      };
      fetchCommunes();
    }
  }, [formData.region, showNotification]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateLength(formData.name, { min: 1, max: 50 })) {
      showNotification('El nombre es requerido y no debe exceder los 50 caracteres.', 'error');
      return;
    }
    if (!validateLength(formData.lastName, { min: 1, max: 100 })) {
      showNotification('Los apellidos son requeridos y no deben exceder los 100 caracteres.', 'error');
      return;
    }
    if (!validateRun(formData.run)) {
      showNotification('El RUN ingresado no es válido.', 'error');
      return;
    }
    if (!validateEmail(formData.email)) {
      showNotification(
        'Correo inválido. Solo se permiten correos de @duoc.cl, @profesor.duoc.cl o @gmail.com.',
        'error'
      );
      return;
    }
    if (!validatePassword(formData.password, { min: 8, strict: true })) {
      showNotification('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.', 'error');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showNotification('Las contraseñas no coinciden.', 'error');
      return;
    }
    if (!validateAge(formData.birthdate)) {
      showNotification('Debes ser mayor de 18 años para registrarte.', 'error');
      return;
    }
    if (!formData.region) {
      showNotification('Debe seleccionar una región.', 'error');
      return;
    }
    if (!formData.commune) {
      showNotification('Debe seleccionar una comuna.', 'error');
      return;
    }
    if (!validateLength(formData.address, { min: 1, max: 300 })) {
      showNotification('La dirección es requerida y no debe exceder los 300 caracteres.', 'error');
      return;
    }

    const users = getLocalStorageItem<UserWithPassword[]>('users') || [];
    const newUser: UserWithPassword = {
      id: `user${Date.now()}`,
      name: formData.name,
      lastName: formData.lastName,
      email: formData.email,
      run: formData.run,
      birthdate: formData.birthdate,
      address: formData.address,
      region: formData.region,
      commune: formData.commune,
      password: simpleHash(formData.password),
      role: 'customer',
    };

    users.push(newUser);
    setLocalStorageItem('users', users);

    showNotification('Registro exitoso.', 'success');
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
                    <img
                      className="logo-img"
                      src="/img/logo.png"
                      alt="Logo Level-Up Gamer"
                      width="72"
                    />
                  </Link>
                </div>
                <h1 className="h3 mb-3 fw-normal text-center">Crea una Cuenta</h1>

                <FormFloating
                  id="name"
                  name="name"
                  type="text"
                  label="Nombre"
                  placeholder="Nombre"
                  required
                  onChange={handleChange}
                  value={formData.name}
                />
                <FormFloating
                  id="lastName"
                  name="lastName"
                  type="text"
                  label="Apellidos"
                  placeholder="Apellidos"
                  required
                  onChange={handleChange}
                  value={formData.lastName}
                />
                <FormFloating
                  id="run"
                  name="run"
                  type="text"
                  label="RUN"
                  placeholder="RUN"
                  required
                  onChange={handleChange}
                  value={formData.run}
                />
                <FormFloating
                  id="email"
                  name="email"
                  type="email"
                  label="Correo Electrónico"
                  placeholder="name@example.com"
                  required
                  onChange={handleChange}
                  value={formData.email}
                />
                <FormFloating
                  id="password"
                  name="password"
                  type="password"
                  label="Contraseña"
                  placeholder="Contraseña"
                  required
                  onChange={handleChange}
                  value={formData.password}
                />
                <FormFloating
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Confirmar Contraseña"
                  placeholder="Confirmar Contraseña"
                  required
                  onChange={handleChange}
                  value={formData.confirmPassword}
                />
                <FormFloating
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  label="Fecha de Nacimiento"
                  required
                  onChange={handleChange}
                  value={formData.birthdate}
                />
                <FormFloating
                  id="address"
                  name="address"
                  type="text"
                  label="Dirección"
                  placeholder="Dirección"
                  required
                  onChange={handleChange}
                  value={formData.address}
                />
                <FormSelect
                  id="region"
                  name="region"
                  label="Región"
                  required
                  onChange={handleChange}
                  value={formData.region}
                  options={[
                    { value: '', label: 'Seleccione Región' },
                    ...regions.map((r) => ({ value: r.codigo, label: r.nombre })),
                  ]}
                  floating
                />
                <FormSelect
                  id="commune"
                  name="commune"
                  label="Comuna"
                  required
                  onChange={handleChange}
                  value={formData.commune}
                  disabled={!formData.region || loadingCommunes}
                  options={[
                    { value: '', label: 'Seleccione Comuna' },
                    ...communes.map((c) => ({ value: c.codigo, label: c.nombre })),
                  ]}
                  floating
                />

                <button
                  className="btn btn-primary w-100 py-2 my-3"
                  type="submit"
                >
                  Registrarse
                </button>

                <p className="mt-4 text-center">
                  ¿Ya tienes una cuenta?
                  <Link to="/login" className="text-primary ms-2">
                    Inicia sesión aquí
                  </Link>
                </p>
                <p className="mt-4 mb-3 text-center copyright-text">© 2025</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
