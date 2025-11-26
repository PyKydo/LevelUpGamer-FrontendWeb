import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createUser,
  deleteUser,
  getUserById,
  getUserRoles,
  getUsers,
  sortUsersByName,
  updateUser,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserDetail,
  type UserSummary,
} from "../../helpers/api.helper";
import { useNotification } from "../../hooks/useNotification";
import dashboardStyles from "../dashboard/Dashboard.module.css";

const initialUserFormState = {
  run: "",
  name: "",
  lastName: "",
  email: "",
  password: "",
  birthdate: "",
  region: "",
  commune: "",
  address: "",
  role: "CLIENTE",
  referralCode: "",
};

type UserFormMode = "create" | "edit";

export const AdminUsersPage = () => {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [defaultRole, setDefaultRole] = useState("CLIENTE");

  const [userFormMode, setUserFormMode] = useState<UserFormMode>("create");
  const [userFormState, setUserFormState] = useState(initialUserFormState);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userFormSubmitting, setUserFormSubmitting] = useState(false);
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userFormTarget, setUserFormTarget] = useState<UserSummary | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UserSummary | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const resetUserForm = () => {
    setUserFormState({
      ...initialUserFormState,
      role: defaultRole,
    });
    setUserFormTarget(null);
    setUserFormLoading(false);
  };

  const closeUserFormModal = () => {
    setUserFormOpen(false);
    resetUserForm();
  };

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const data = await getUsers();
        if (isMounted) {
          setUsers(sortUsersByName(data));
        }
      } catch (error) {
        console.error("Error loading users:", error);
        showNotification("No se pudieron cargar los usuarios.", "error");
      } finally {
        if (isMounted) {
          setLoadingUsers(false);
        }
      }
    };

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, [showNotification]);

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      const roles = await getUserRoles();
      if (isMounted) {
        setUserRoles(roles);
        if (roles.length) {
          setDefaultRole(roles[0]);
        }
      }
    };

    void loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalUsers = users.length;
  const adminCount = useMemo(
    () => users.filter((user) => user.role === "ADMINISTRADOR").length,
    [users]
  );
  const sellerCount = useMemo(
    () => users.filter((user) => user.role === "VENDEDOR").length,
    [users]
  );

  const handleUserFormChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setUserFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openCreateUserModal = () => {
    setUserFormMode("create");
    resetUserForm();
    setUserFormState((current) => ({
      ...current,
      role: defaultRole,
    }));
    setUserFormOpen(true);
  };

  const openEditUserModal = async (user: UserSummary) => {
    setUserFormMode("edit");
    setUserFormTarget(user);
    setUserFormLoading(true);
    setUserFormOpen(true);

    try {
      const detail = await getUserById(user.id);
      if (!detail) {
        showNotification("No se pudo obtener la información del usuario.", "error");
        closeUserFormModal();
        return;
      }
      setUserFormState({
        run: detail.run ?? "",
        name: detail.name,
        lastName: detail.lastName,
        email: detail.email,
        password: "",
        birthdate: detail.birthdate?.slice(0, 10) ?? "",
        region: detail.region ?? "",
        commune: detail.commune ?? "",
        address: detail.address ?? "",
        role: detail.role,
        referralCode: "",
      });
    } catch (error) {
      console.error("Error loading user detail:", error);
      showNotification("No se pudo obtener la información del usuario.", "error");
      closeUserFormModal();
    } finally {
      setUserFormLoading(false);
    }
  };

  const openDetailModal = async (user: UserSummary) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailUser(null);

    try {
      const detail = await getUserById(user.id);
      if (!detail) {
        showNotification("No se pudo cargar el detalle del usuario.", "error");
        setDetailModalOpen(false);
        return;
      }
      setDetailUser({ ...detail, role: user.role });
    } catch (error) {
      console.error("Error loading user detail:", error);
      showNotification("No se pudo cargar el detalle del usuario.", "error");
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const validateUserForm = (): boolean => {
    if (!userFormState.name.trim() || !userFormState.lastName.trim()) {
      showNotification("Nombre y apellidos son obligatorios.", "error");
      return false;
    }

    if (userFormMode === "create") {
      if (!userFormState.run.trim()) {
        showNotification("El RUN es obligatorio.", "error");
        return false;
      }
      if (!userFormState.email.trim()) {
        showNotification("El correo es obligatorio.", "error");
        return false;
      }
      if (!userFormState.password.trim()) {
        showNotification("Debes definir una contraseña inicial.", "error");
        return false;
      }
      if (!userFormState.birthdate) {
        showNotification("La fecha de nacimiento es obligatoria.", "error");
        return false;
      }
    }

    if (!userFormState.region.trim() || !userFormState.commune.trim()) {
      showNotification("Región y comuna son obligatorias.", "error");
      return false;
    }

    if (!userFormState.address.trim()) {
      showNotification("La dirección es obligatoria.", "error");
      return false;
    }

    return true;
  };

  const handleUserFormSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateUserForm()) {
      return;
    }

    setUserFormSubmitting(true);

    try {
      if (userFormMode === "create") {
        const payload: CreateUserPayload = {
          run: userFormState.run.trim(),
          name: userFormState.name.trim(),
          lastName: userFormState.lastName.trim(),
          email: userFormState.email.trim(),
          password: userFormState.password.trim(),
          birthdate: userFormState.birthdate,
          region: userFormState.region.trim(),
          commune: userFormState.commune.trim(),
          address: userFormState.address.trim(),
          role: userFormState.role,
          referralCode: userFormState.referralCode.trim() || undefined,
        };

        await createUser(payload);
        const refreshed = await getUsers();
        setUsers(sortUsersByName(refreshed));
        showNotification("Usuario creado correctamente.", "success");
      } else if (userFormTarget) {
        const payload: UpdateUserPayload = {
          name: userFormState.name.trim(),
          lastName: userFormState.lastName.trim(),
          region: userFormState.region.trim(),
          commune: userFormState.commune.trim(),
          address: userFormState.address.trim(),
        };

        await updateUser(userFormTarget.id, payload);
        const refreshed = await getUsers();
        setUsers(sortUsersByName(refreshed));
        showNotification("Usuario actualizado correctamente.", "success");
      }

      closeUserFormModal();
    } catch (error) {
      console.error("Error saving user:", error);
      showNotification("No se pudo guardar el usuario.", "error");
    } finally {
      setUserFormSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingUser(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((current) => current.filter((user) => user.id !== deleteTarget.id));
      showNotification("Usuario eliminado correctamente.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("No se pudo eliminar el usuario.", "error");
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div className={dashboardStyles.dashboardWrapper}>
      <div className="container">
        <header className={`${dashboardStyles.dashboardHeader} mb-4`}>
          <div className={dashboardStyles.headerContent}>
            <p className={dashboardStyles.dashboardEyebrow}>Operaciones para Usuarios</p>
            <h1 className={dashboardStyles.dashboardHeadline}>Gestión de Usuarios</h1>
            <p className={dashboardStyles.dashboardDescription}>
              Crea, edita o elimina accesos para mantener la plataforma bajo control.
            </p>
          </div>
          <span className={`${dashboardStyles.roleBadge} ${dashboardStyles.roleAdmin}`}>
            Administrador
          </span>
        </header>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeNeutral}`}>
            Total: {totalUsers}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeHealthy}`}>
            Admins: {adminCount}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeLowStock}`}>
            Vendedores: {sellerCount}
          </span>
        </div>

        <div className={dashboardStyles.tableCard}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div>
              <p className={dashboardStyles.dashboardEyebrow}>Control de accesos</p>
              <h2 className={dashboardStyles.tableTitle}>Usuarios registrados</h2>
            </div>
            <button
              type="button"
              className={dashboardStyles.primaryButton}
              onClick={openCreateUserModal}
            >
              Nuevo usuario
            </button>
          </div>

          {loadingUsers ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" role="status" aria-label="Cargando usuarios" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted mb-0">No hay usuarios registrados.</p>
          ) : (
            <div className={dashboardStyles.tableResponsive}>
              <table className={`table ${dashboardStyles.table}`}>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <p className="mb-0 text-white fw-semibold">{user.fullName}</p>
                          <small className={dashboardStyles.helperText}>ID: {user.id}</small>
                        </div>
                      </td>
                      <td>
                        <span className={dashboardStyles.tableValue}>{user.email}</span>
                      </td>
                      <td>
                        <span className={`${dashboardStyles.tableBadge} ${dashboardStyles.badgeNeutral}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className={dashboardStyles.actionGroup}>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => openDetailModal(user)}
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => openEditUserModal(user)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => setDeleteTarget(user)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {userFormOpen && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>
                    {userFormMode === "create" ? "Crear usuario" : "Editar usuario"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={closeUserFormModal}
                    disabled={userFormSubmitting}
                  />
                </div>
                <form onSubmit={handleUserFormSubmit}>
                  <div className="modal-body">
                    {userFormLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-light" role="status" aria-label="Cargando formulario" />
                      </div>
                    ) : (
                      <div className={dashboardStyles.modalFormGrid}>
                        <div className={dashboardStyles.modalFormField}>
                          <label className={dashboardStyles.formLabel} htmlFor="user-run">
                            RUN
                          </label>
                          <input
                            id="user-run"
                            name="run"
                            type="text"
                            className={dashboardStyles.darkField}
                            value={userFormState.run}
                            onChange={handleUserFormChange}
                            disabled={userFormMode === "edit"}
                          />
                        </div>
                        <div className={dashboardStyles.modalFormField}>
                          <label className={dashboardStyles.formLabel} htmlFor="user-name">
                            Nombre
                          </label>
                          <input
                            id="user-name"
                            name="name"
                            type="text"
                            className={dashboardStyles.darkField}
                            value={userFormState.name}
                            onChange={handleUserFormChange}
                            required
                          />
                        </div>
                        <div className={dashboardStyles.modalFormField}>
                          <label className={dashboardStyles.formLabel} htmlFor="user-lastName">
                            Apellidos
                          </label>
                          <input
                            id="user-lastName"
                            name="lastName"
                            type="text"
                            className={dashboardStyles.darkField}
                            value={userFormState.lastName}
                            onChange={handleUserFormChange}
                            required
                          />
                        </div>
                        <div className={dashboardStyles.modalFormField}>
                          <label className={dashboardStyles.formLabel} htmlFor="user-email">
                            Correo
                          </label>
                          <input
                            id="user-email"
                            name="email"
                            type="email"
                            className={dashboardStyles.darkField}
                            value={userFormState.email}
                            onChange={handleUserFormChange}
                            disabled={userFormMode === "edit"}
                          />
                        </div>
                        {userFormMode === "create" && (
                          <div className={dashboardStyles.modalFormField}>
                            <label className={dashboardStyles.formLabel} htmlFor="user-password">
                              Contraseña inicial
                            </label>
                            <input
                              id="user-password"
                              name="password"
                              type="password"
                              className={dashboardStyles.darkField}
                              value={userFormState.password}
                              onChange={handleUserFormChange}
                              required
                            />
                          </div>
                        )}
                        <div className={dashboardStyles.modalFormField}>
                          <label className={dashboardStyles.formLabel} htmlFor="user-birthdate">
                            Fecha de nacimiento
                          </label>
                          <input
                            id="user-birthdate"
                            name="birthdate"
                            type="date"
                            className={dashboardStyles.darkField}
                            value={userFormState.birthdate}
                            onChange={handleUserFormChange}
                            disabled={userFormMode === "edit"}
                          />
                        </div>
                        <div className={dashboardStyles.modalFormField}>
                          <label className={dashboardStyles.formLabel} htmlFor="user-role">
                            Rol
                          </label>
                          <select
                            id="user-role"
                            name="role"
                            className={`${dashboardStyles.darkField} ${dashboardStyles.darkSelect}`}
                            value={userFormState.role}
                            onChange={handleUserFormChange}
                            disabled={userFormMode === "edit"}
                          >
                            {(userRoles.length ? userRoles : [defaultRole]).map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={dashboardStyles.modalFormField}>
                          <label className={dashboardStyles.formLabel} htmlFor="user-region">
                            Región
                          </label>
                          <input
                            id="user-region"
                            name="region"
                            type="text"
                            className={dashboardStyles.darkField}
                            value={userFormState.region}
                            onChange={handleUserFormChange}
                            required
                          />
                        </div>
                        <div className={dashboardStyles.modalFormField}>
                          <label className={dashboardStyles.formLabel} htmlFor="user-commune">
                            Comuna
                          </label>
                          <input
                            id="user-commune"
                            name="commune"
                            type="text"
                            className={dashboardStyles.darkField}
                            value={userFormState.commune}
                            onChange={handleUserFormChange}
                            required
                          />
                        </div>
                        <div className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                          <label className={dashboardStyles.formLabel} htmlFor="user-address">
                            Dirección
                          </label>
                          <input
                            id="user-address"
                            name="address"
                            type="text"
                            className={dashboardStyles.darkField}
                            value={userFormState.address}
                            onChange={handleUserFormChange}
                            required
                          />
                        </div>
                        {userFormMode === "create" && (
                          <div className={dashboardStyles.modalFormField}>
                            <label className={dashboardStyles.formLabel} htmlFor="user-referral">
                              Código referido (opcional)
                            </label>
                            <input
                              id="user-referral"
                              name="referralCode"
                              type="text"
                              className={dashboardStyles.darkField}
                              value={userFormState.referralCode}
                              onChange={handleUserFormChange}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                    <div className={dashboardStyles.modalActions}>
                      <button
                        type="button"
                        className={dashboardStyles.ghostButton}
                        onClick={closeUserFormModal}
                        disabled={userFormSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={dashboardStyles.primaryButton}
                        disabled={userFormSubmitting || userFormLoading}
                      >
                        {userFormSubmitting
                          ? "Guardando..."
                          : userFormMode === "create"
                          ? "Crear usuario"
                          : "Actualizar usuario"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {detailModalOpen && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>
                    Detalle de usuario
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => {
                      setDetailModalOpen(false);
                      setDetailUser(null);
                    }}
                  />
                </div>
                <div className="modal-body">
                  {detailLoading || !detailUser ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-light" role="status" aria-label="Cargando detalle" />
                    </div>
                  ) : (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <p className="mb-1 text-muted">Nombre completo</p>
                        <p className="text-white fw-semibold">{detailUser.fullName}</p>
                      </div>
                      <div className="col-md-3">
                        <p className="mb-1 text-muted">RUN</p>
                        <p className="text-white fw-semibold">{detailUser.run ?? "-"}</p>
                      </div>
                      <div className="col-md-3">
                        <p className="mb-1 text-muted">Rol</p>
                        <p className="text-white fw-semibold">{detailUser.role}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 text-muted">Correo</p>
                        <p className="text-white fw-semibold">{detailUser.email}</p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1 text-muted">Fecha de nacimiento</p>
                        <p className="text-white fw-semibold">{detailUser.birthdate?.slice(0, 10) ?? "-"}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="mb-1 text-muted">Región</p>
                        <p className="text-white fw-semibold">{detailUser.region ?? "-"}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="mb-1 text-muted">Comuna</p>
                        <p className="text-white fw-semibold">{detailUser.commune ?? "-"}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="mb-1 text-muted">Dirección</p>
                        <p className="text-white fw-semibold">{detailUser.address ?? "-"}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <button
                    type="button"
                    className={dashboardStyles.primaryButton}
                    onClick={() => {
                      setDetailModalOpen(false);
                      setDetailUser(null);
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {deleteTarget && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>
                    Eliminar usuario
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deletingUser}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    ¿Seguro que deseas eliminar a
                    {" "}
                    <span className="fw-semibold">{deleteTarget.fullName}</span>?
                  </p>
                  <p className={dashboardStyles.helperText}>
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <div className={dashboardStyles.modalActions}>
                    <button
                      type="button"
                      className={dashboardStyles.ghostButton}
                      onClick={() => setDeleteTarget(null)}
                      disabled={deletingUser}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={dashboardStyles.dangerButton}
                      onClick={handleDeleteUser}
                      disabled={deletingUser}
                    >
                      {deletingUser ? "Eliminando..." : "Eliminar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
};
