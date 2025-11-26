import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  updateProductCategory,
  type CreateCategoryPayload,
  type ProductCategory,
  type UpdateCategoryPayload,
} from "../../helpers/api.helper";
import { useNotification } from "../../hooks/useNotification";
import dashboardStyles from "../dashboard/Dashboard.module.css";

const initialCategoryFormState = {
  code: "",
  name: "",
  description: "",
  active: true,
};

type CategoryFormMode = "create" | "edit";

const sortCategoriesByName = (list: ProductCategory[]): ProductCategory[] =>
  [...list].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );

export const AdminCategoriesPage = () => {
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formMode, setFormMode] = useState<CategoryFormMode>("create");
  const [formState, setFormState] = useState(initialCategoryFormState);
  const [formOpen, setFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formTarget, setFormTarget] = useState<ProductCategory | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await getProductCategories();
      setCategories(sortCategoriesByName(data));
    } catch (error) {
      console.error("Error loading categories:", error);
      showNotification("No se pudieron cargar las categorías.", "error");
    } finally {
      setLoadingCategories(false);
    }
  }, [showNotification]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const totalCategories = categories.length;
  const activeCategories = useMemo(
    () => categories.filter((category) => category.active).length,
    [categories]
  );
  const inactiveCategories = totalCategories - activeCategories;

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === "checkbox";
    const nextValue = isCheckbox ? target.checked : value;
    setFormState((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const openCreateModal = () => {
    setFormMode("create");
    setFormTarget(null);
    setFormState(initialCategoryFormState);
    setFormOpen(true);
  };

  const openEditModal = (category: ProductCategory) => {
    setFormMode("edit");
    setFormTarget(category);
    setFormState({
      code: category.code,
      name: category.name,
      description: category.description,
      active: category.active,
    });
    setFormOpen(true);
  };

  const closeFormModal = () => {
    setFormOpen(false);
    setFormTarget(null);
    setFormState(initialCategoryFormState);
  };

  const refreshCategories = async () => {
    await loadCategories();
  };

  const validateForm = (): boolean => {
    if (!formState.code.trim()) {
      showNotification("El código es obligatorio.", "error");
      return false;
    }

    if (!formState.name.trim()) {
      showNotification("El nombre es obligatorio.", "error");
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormSubmitting(true);

    try {
      if (formMode === "create") {
        const payload: CreateCategoryPayload = {
          code: formState.code.trim(),
          name: formState.name.trim(),
          description: formState.description.trim() || undefined,
          active: formState.active,
        };
        await createProductCategory(payload);
        showNotification("Categoría creada correctamente.", "success");
      } else if (formTarget) {
        const payload: UpdateCategoryPayload = {
          code: formState.code.trim(),
          name: formState.name.trim(),
          description: formState.description.trim(),
          active: formState.active,
        };
        await updateProductCategory(formTarget.id, payload);
        showNotification("Categoría actualizada correctamente.", "success");
      }

      await refreshCategories();
      closeFormModal();
    } catch (error) {
      console.error("Error saving category:", error);
      showNotification("No se pudo guardar la categoría.", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingCategory(true);
    try {
      await deleteProductCategory(deleteTarget.id);
      setCategories((current) =>
        sortCategoriesByName(
          current.filter((category) => category.id !== deleteTarget.id)
        )
      );
      showNotification("Categoría eliminada correctamente.", "success");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      showNotification("No se pudo eliminar la categoría.", "error");
    } finally {
      setDeletingCategory(false);
    }
  };

  return (
    <div className={dashboardStyles.dashboardWrapper}>
      <div className="container">
        <header className={`${dashboardStyles.dashboardHeader} mb-4`}>
          <div className={dashboardStyles.headerContent}>
            <p className={dashboardStyles.dashboardEyebrow}>Catálogo maestro</p>
            <h1 className={dashboardStyles.dashboardHeadline}>Categorías de productos</h1>
            <p className={dashboardStyles.dashboardDescription}>
              Mantén ordenado el árbol de categorías para alinear campañas y filtros de búsqueda.
            </p>
          </div>
          <span className={`${dashboardStyles.roleBadge} ${dashboardStyles.roleAdmin}`}>
            Administrador
          </span>
        </header>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeNeutral}`}>
            Total: {totalCategories}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeHealthy}`}>
            Activas: {activeCategories}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeLowStock}`}>
            Inactivas: {inactiveCategories}
          </span>
        </div>

        <div className={dashboardStyles.tableCard}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div>
              <p className={dashboardStyles.dashboardEyebrow}>Clasificación</p>
              <h2 className={dashboardStyles.tableTitle}>Listado de categorías</h2>
            </div>
            <button
              type="button"
              className={dashboardStyles.primaryButton}
              onClick={openCreateModal}
            >
              Nueva categoría
            </button>
          </div>

          {loadingCategories ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" role="status" aria-label="Cargando categorías" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-muted mb-0">Aún no hay categorías registradas.</p>
          ) : (
            <div className={dashboardStyles.tableResponsive}>
              <table className={`table ${dashboardStyles.table}`}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Código</th>
                    <th>Estado</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <div>
                          <p className="mb-0 text-white fw-semibold">{category.name}</p>
                          <small className={dashboardStyles.helperText}>#{category.id}</small>
                        </div>
                      </td>
                      <td>
                        <span className={dashboardStyles.tableValue}>{category.code}</span>
                      </td>
                      <td>
                        <span
                          className={`${dashboardStyles.tableBadge} ${
                            category.active
                              ? dashboardStyles.badgeHealthy
                              : dashboardStyles.badgeLowStock
                          }`}
                        >
                          {category.active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td>
                        <span className={dashboardStyles.helperText}>
                          {category.description || "Sin descripción"}
                        </span>
                      </td>
                      <td>
                        <div className={dashboardStyles.actionGroup}>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => openEditModal(category)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => setDeleteTarget(category)}
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

      {formOpen && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>
                    {formMode === "create" ? "Nueva categoría" : "Editar categoría"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={closeFormModal}
                    disabled={formSubmitting}
                  />
                </div>
                <form onSubmit={handleFormSubmit}>
                  <div className="modal-body">
                    <div className={dashboardStyles.modalFormGrid}>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="category-code">
                          Código
                        </label>
                        <input
                          id="category-code"
                          name="code"
                          type="text"
                          className={dashboardStyles.darkField}
                          value={formState.code}
                          onChange={handleFieldChange}
                          required
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="category-name">
                          Nombre
                        </label>
                        <input
                          id="category-name"
                          name="name"
                          type="text"
                          className={dashboardStyles.darkField}
                          value={formState.name}
                          onChange={handleFieldChange}
                          required
                        />
                      </div>
                      <div className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                        <label className={dashboardStyles.formLabel} htmlFor="category-description">
                          Descripción
                        </label>
                        <textarea
                          id="category-description"
                          name="description"
                          className={`${dashboardStyles.darkField} ${dashboardStyles.darkTextarea}`}
                          rows={3}
                          value={formState.description}
                          onChange={handleFieldChange}
                          placeholder="Describe el propósito de la categoría"
                        />
                      </div>
                      <div className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="category-active"
                            name="active"
                            checked={formState.active}
                            onChange={handleFieldChange}
                          />
                          <label className="form-check-label" htmlFor="category-active">
                            Mostrar en catálogos públicos
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                    <div className={dashboardStyles.modalActions}>
                      <button
                        type="button"
                        className={dashboardStyles.ghostButton}
                        onClick={closeFormModal}
                        disabled={formSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={dashboardStyles.primaryButton}
                        disabled={formSubmitting}
                      >
                        {formSubmitting
                          ? "Guardando..."
                          : formMode === "create"
                          ? "Crear categoría"
                          : "Actualizar categoría"}
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

      {deleteTarget && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>
                    Eliminar categoría
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deletingCategory}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    ¿Estás seguro de eliminar la categoría
                    {" "}
                    <span className="fw-semibold">{deleteTarget.name}</span>?
                  </p>
                  <p className={dashboardStyles.helperText}>
                    Los productos asociados conservarán su referencia, pero ya no aparecerá en filtros.
                  </p>
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <div className={dashboardStyles.modalActions}>
                    <button
                      type="button"
                      className={dashboardStyles.ghostButton}
                      onClick={() => setDeleteTarget(null)}
                      disabled={deletingCategory}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={dashboardStyles.dangerButton}
                      onClick={handleDeleteCategory}
                      disabled={deletingCategory}
                    >
                      {deletingCategory ? "Eliminando..." : "Eliminar"}
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
