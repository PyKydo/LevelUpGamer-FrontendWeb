import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createProductReview,
  deleteAdminReview,
  getAllProductReviews,
  getProducts,
  updateAdminReview,
  type CreateReviewPayload,
  type Product,
  type ProductReview,
  type UpdateReviewPayload,
} from "../../helpers/api.helper";
import { reportError } from "../../helpers/logging.helper";
import { useNotification } from "../../hooks/useNotification";
import dashboardStyles from "../dashboard/Dashboard.module.css";

const REVIEW_RATINGS = [5, 4, 3, 2, 1];

const initialReviewFormState = {
  productId: "",
  rating: 5,
  text: "",
  visible: true,
};

type ReviewFormMode = "create" | "edit";
type ReviewFormState = typeof initialReviewFormState;

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const formatReviewDate = (value?: string): string => {
  if (!value) {
    return "-";
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return dateFormatter.format(new Date(timestamp));
};

const resolveStars = (rating: number): string => {
  const rounded = Math.max(1, Math.min(5, rating));
  return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
};

export const AdminReviewsPage = () => {
  const { showNotification } = useNotification();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const productsRef = useRef<Product[]>([]);

  const [reviewFormMode, setReviewFormMode] = useState<ReviewFormMode>("create");
  const [reviewFormState, setReviewFormState] =
    useState<ReviewFormState>(initialReviewFormState);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewFormSubmitting, setReviewFormSubmitting] = useState(false);
  const [reviewFormTarget, setReviewFormTarget] = useState<ProductReview | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailReview, setDetailReview] = useState<ProductReview | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ProductReview | null>(null);
  const [deletingReview, setDeletingReview] = useState(false);

  const refreshReviews = useCallback(
    async (productSnapshot?: Product[]) => {
      setLoadingReviews(true);
      try {
        const sourceProducts = productSnapshot ?? productsRef.current;
        if (!sourceProducts.length) {
          setReviews([]);
          return;
        }

        const data = await getAllProductReviews(sourceProducts);
        setReviews(data);
      } catch (error) {
        reportError("AdminReviewsPage:refreshReviews", error);
        showNotification("No se pudieron cargar las reseñas.", "error");
      } finally {
        setLoadingReviews(false);
      }
    },
    [showNotification]
  );

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await getProducts({ includeInactive: true });
      productsRef.current = data;
      setProducts(data);
      await refreshReviews(data);
    } catch (error) {
      reportError("AdminReviewsPage:loadProducts", error);
    } finally {
      setLoadingProducts(false);
    }
  }, [refreshReviews]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const productLookup = useMemo(() => {
    const map = new Map<number, string>();
    products.forEach((product) => {
      map.set(product.id, product.name);
    });
    return map;
  }, [products]);

  const getProductLabel = useCallback(
    (review: ProductReview | null): string => {
      if (!review) {
        return "-";
      }
      return (
        review.productName ??
        productLookup.get(review.productId) ??
        `Producto #${review.productId}`
      );
    },
    [productLookup]
  );

  const publishedCount = useMemo(
    () => reviews.filter((review) => review.visible !== false).length,
    [reviews]
  );
  const hiddenCount = reviews.length - publishedCount;

  const handleReviewFieldChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    const target =
      event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === "checkbox";
    const rawValue = isCheckbox ? target.checked : value;

    if (name === "visible") {
      setReviewFormState((current) => ({
        ...current,
        visible: Boolean(rawValue),
      }));
      return;
    }

    if (name === "rating") {
      setReviewFormState((current) => ({
        ...current,
        rating: Number(rawValue),
      }));
      return;
    }

    if (name === "productId") {
      setReviewFormState((current) => ({
        ...current,
        productId: String(rawValue),
      }));
      return;
    }

    setReviewFormState((current) => ({
      ...current,
      text: String(rawValue),
    }));
  };

  const openCreateReviewModal = () => {
    setReviewFormMode("create");
    setReviewFormTarget(null);
    setReviewFormState(initialReviewFormState);
    setReviewFormOpen(true);
  };

  const openEditReviewModal = (review: ProductReview) => {
    setReviewFormMode("edit");
    setReviewFormTarget(review);
    setReviewFormState({
      productId: String(review.productId),
      rating: review.rating,
      text: review.text,
      visible: review.visible !== false,
    });
    setReviewFormOpen(true);
  };

  const closeReviewFormModal = () => {
    setReviewFormOpen(false);
    setReviewFormTarget(null);
    setReviewFormState(initialReviewFormState);
  };

  const openDetailModal = (review: ProductReview) => {
    setDetailReview(review);
    setDetailModalOpen(true);
  };

  const validateReviewForm = (productId: number): boolean => {
    if (!Number.isFinite(productId) || productId <= 0) {
      showNotification("Selecciona un producto válido.", "error");
      return false;
    }

    if (!reviewFormState.text.trim()) {
      showNotification("Ingresa el contenido de la reseña.", "error");
      return false;
    }

    if (reviewFormState.rating < 1 || reviewFormState.rating > 5) {
      showNotification("La calificación debe estar entre 1 y 5.", "error");
      return false;
    }

    return true;
  };

  const handleReviewFormSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const productId = Number(reviewFormState.productId);
    if (!validateReviewForm(productId)) {
      return;
    }

    setReviewFormSubmitting(true);

    try {
      if (reviewFormMode === "create") {
        const payload: CreateReviewPayload = {
          productId,
          rating: reviewFormState.rating,
          text: reviewFormState.text.trim(),
        };
        const created = await createProductReview(payload);
        if (reviewFormState.visible === false) {
          await updateAdminReview(created.id, { visible: false });
        }
        showNotification("Reseña creada correctamente.", "success");
      } else if (reviewFormTarget) {
        const payload: UpdateReviewPayload = {
          text: reviewFormState.text.trim(),
          rating: reviewFormState.rating,
          visible: reviewFormState.visible,
        };
        await updateAdminReview(reviewFormTarget.id, payload);
        showNotification("Reseña actualizada correctamente.", "success");
      }

      await refreshReviews();
      closeReviewFormModal();
    } catch (error) {
      reportError("AdminReviewsPage:saveReview", error);
      showNotification("No se pudo guardar la reseña.", "error");
    } finally {
      setReviewFormSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingReview(true);
    try {
      await deleteAdminReview(deleteTarget.id);
      setReviews((current) =>
        current.filter((review) => review.id !== deleteTarget.id)
      );
      showNotification("Reseña eliminada correctamente.", "success");
      setDeleteTarget(null);
    } catch (error) {
      reportError("AdminReviewsPage:deleteReview", error);
      showNotification("No se pudo eliminar la reseña.", "error");
    } finally {
      setDeletingReview(false);
    }
  };

  return (
    <div className={dashboardStyles.dashboardWrapper}>
      <div className="container">
        <header className={`${dashboardStyles.dashboardHeader} mb-4`}>
          <div className={dashboardStyles.headerContent}>
            <p className={dashboardStyles.dashboardEyebrow}>Confianza de clientes</p>
            <h1 className={dashboardStyles.dashboardHeadline}>Gestión de reseñas</h1>
            <p className={dashboardStyles.dashboardDescription}>
              Modera comentarios, corrige calificaciones y mantén la reputación del catálogo.
            </p>
          </div>
          <span className={`${dashboardStyles.roleBadge} ${dashboardStyles.roleAdmin}`}>
            Administrador
          </span>
        </header>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeNeutral}`}>
            Total: {reviews.length}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeHealthy}`}>
            Publicadas: {publishedCount}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeLowStock}`}>
            Ocultas: {hiddenCount}
          </span>
        </div>

        <div className={dashboardStyles.tableCard}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div>
              <p className={dashboardStyles.dashboardEyebrow}>Moderación</p>
              <h2 className={dashboardStyles.tableTitle}>Reseñas de productos</h2>
            </div>
            <button
              type="button"
              className={dashboardStyles.primaryButton}
              onClick={openCreateReviewModal}
            >
              Nueva reseña
            </button>
          </div>

          {loadingReviews ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" role="status" aria-label="Cargando reseñas" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted mb-0">Todavía no hay reseñas registradas.</p>
          ) : (
            <div className={dashboardStyles.tableResponsive}>
              <table className={`table ${dashboardStyles.table}`}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cliente</th>
                    <th>Calificación</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td>
                        <div>
                          <p className="mb-0 text-white fw-semibold">{getProductLabel(review)}</p>
                          <small className={dashboardStyles.helperText}>ID producto: {review.productId}</small>
                        </div>
                      </td>
                      <td>
                        <span className={dashboardStyles.tableValue}>{review.userName}</span>
                      </td>
                      <td>
                        <span className={dashboardStyles.tableValue}>{resolveStars(review.rating)}</span>
                      </td>
                      <td>
                        <span
                          className={`${dashboardStyles.tableBadge} ${
                            review.visible === false
                              ? dashboardStyles.badgeLowStock
                              : dashboardStyles.badgeHealthy
                          }`}
                        >
                          {review.visible === false ? "Oculta" : "Publicada"}
                        </span>
                      </td>
                      <td>
                        <span className={dashboardStyles.helperText}>{formatReviewDate(review.createdAt)}</span>
                      </td>
                      <td>
                        <div className={dashboardStyles.actionGroup}>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => openDetailModal(review)}
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => openEditReviewModal(review)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => setDeleteTarget(review)}
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

      {reviewFormOpen && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>
                    {reviewFormMode === "create" ? "Nueva reseña" : "Editar reseña"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={closeReviewFormModal}
                    disabled={reviewFormSubmitting}
                  />
                </div>
                <form onSubmit={handleReviewFormSubmit}>
                  <div className="modal-body">
                    <div className={dashboardStyles.modalFormGrid}>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="review-product">
                          Producto
                        </label>
                        <select
                          id="review-product"
                          name="productId"
                          className={`${dashboardStyles.darkField} ${dashboardStyles.darkSelect}`}
                          value={reviewFormState.productId}
                          onChange={handleReviewFieldChange}
                          disabled={reviewFormMode === "edit" || loadingProducts}
                          required
                        >
                          <option value="">Selecciona un producto</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="review-rating">
                          Calificación
                        </label>
                        <select
                          id="review-rating"
                          name="rating"
                          className={`${dashboardStyles.darkField} ${dashboardStyles.darkSelect}`}
                          value={reviewFormState.rating}
                          onChange={handleReviewFieldChange}
                        >
                          {REVIEW_RATINGS.map((rating) => (
                            <option key={rating} value={rating}>
                              {rating} estrellas
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                        <label className={dashboardStyles.formLabel} htmlFor="review-text">
                          Comentario
                        </label>
                        <textarea
                          id="review-text"
                          name="text"
                          className={`${dashboardStyles.darkField} ${dashboardStyles.darkTextarea}`}
                          rows={4}
                          maxLength={1000}
                          value={reviewFormState.text}
                          onChange={handleReviewFieldChange}
                          placeholder="Describe la experiencia del cliente"
                          required
                        />
                      </div>
                      <div className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="review-visible"
                            name="visible"
                            checked={reviewFormState.visible}
                            onChange={handleReviewFieldChange}
                          />
                          <label className="form-check-label" htmlFor="review-visible">
                            Mostrar reseña públicamente
                          </label>
                        </div>
                        {reviewFormMode === "create" && (
                          <p className={dashboardStyles.helperText}>
                            Las reseñas nuevas se crean con el usuario actual como autor visible.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                    <div className={dashboardStyles.modalActions}>
                      <button
                        type="button"
                        className={dashboardStyles.ghostButton}
                        onClick={closeReviewFormModal}
                        disabled={reviewFormSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={dashboardStyles.primaryButton}
                        disabled={reviewFormSubmitting}
                      >
                        {reviewFormSubmitting
                          ? "Guardando..."
                          : reviewFormMode === "create"
                          ? "Crear reseña"
                          : "Actualizar reseña"}
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
                    Detalle de reseña
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => {
                      setDetailModalOpen(false);
                      setDetailReview(null);
                    }}
                  />
                </div>
                <div className="modal-body">
                  {!detailReview ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-light" role="status" aria-label="Cargando detalle" />
                    </div>
                  ) : (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <p className="mb-1 text-muted">Producto</p>
                        <p className="text-white fw-semibold">{getProductLabel(detailReview)}</p>
                      </div>
                      <div className="col-md-3">
                        <p className="mb-1 text-muted">Calificación</p>
                        <p className="text-white fw-semibold">{resolveStars(detailReview.rating)}</p>
                      </div>
                      <div className="col-md-3">
                        <p className="mb-1 text-muted">Estado</p>
                        <p className="text-white fw-semibold">
                          {detailReview.visible === false ? "Oculta" : "Publicada"}
                        </p>
                      </div>
                      <div className="col-md-4">
                        <p className="mb-1 text-muted">Autor</p>
                        <p className="text-white fw-semibold">{detailReview.userName}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="mb-1 text-muted">Fecha</p>
                        <p className="text-white fw-semibold">{formatReviewDate(detailReview.createdAt)}</p>
                      </div>
                      <div className="col-12">
                        <p className="mb-1 text-muted">Comentario</p>
                        <p className="text-white">{detailReview.text}</p>
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
                      setDetailReview(null);
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
                    Eliminar reseña
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deletingReview}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    ¿Deseas eliminar la reseña de
                    {" "}
                    <span className="fw-semibold">{getProductLabel(deleteTarget)}</span>?
                  </p>
                  <p className={dashboardStyles.helperText}>Esta acción no se puede deshacer.</p>
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <div className={dashboardStyles.modalActions}>
                    <button
                      type="button"
                      className={dashboardStyles.ghostButton}
                      onClick={() => setDeleteTarget(null)}
                      disabled={deletingReview}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={dashboardStyles.dangerButton}
                      onClick={handleDeleteReview}
                      disabled={deletingReview}
                    >
                      {deletingReview ? "Eliminando..." : "Eliminar"}
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
