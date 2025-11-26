import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createBlogPost,
  deleteBlogPost,
  getAdminBlogById,
  getAdminBlogs,
  sortBlogsByPublishedDate,
  updateBlogPost,
  type AdminBlog,
  type CreateBlogPayload,
  type UpdateBlogPayload,
} from "../../helpers/api.helper";
import { reportError } from "../../helpers/logging.helper";
import { useNotification } from "../../hooks/useNotification";
import dashboardStyles from "../dashboard/Dashboard.module.css";

const initialBlogFormState = {
  title: "",
  author: "",
  summary: "",
  publishedAt: "",
  contentPath: "",
  imagePath: "",
  altText: "",
};

type BlogFormMode = "create" | "edit";

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
});

const toDateInputValue = (value?: string): string => {
  if (!value) {
    return "";
  }
  if (value.length >= 10) {
    return value.slice(0, 10);
  }
  const parsed = Date.parse(value);
  if (Number.isFinite(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return "";
};

const formatPublishedDate = (value?: string): string => {
  if (!value) {
    return "Sin fecha";
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return dateFormatter.format(new Date(parsed));
};

const getPublishTimestamp = (value?: string): number => {
  if (!value) {
    return 0;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const AdminBlogsPage = () => {
  const { showNotification } = useNotification();

  const [blogs, setBlogs] = useState<AdminBlog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  const [blogFormMode, setBlogFormMode] = useState<BlogFormMode>("create");
  const [blogFormState, setBlogFormState] = useState(initialBlogFormState);
  const [blogFormOpen, setBlogFormOpen] = useState(false);
  const [blogFormSubmitting, setBlogFormSubmitting] = useState(false);
  const [blogFormLoading, setBlogFormLoading] = useState(false);
  const [blogFormTarget, setBlogFormTarget] = useState<AdminBlog | null>(null);
  const [blogFormImageFile, setBlogFormImageFile] = useState<File | null>(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailBlog, setDetailBlog] = useState<AdminBlog | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<AdminBlog | null>(null);
  const [deletingBlog, setDeletingBlog] = useState(false);

  const loadBlogs = useCallback(async () => {
    try {
      const data = await getAdminBlogs();
      setBlogs(sortBlogsByPublishedDate(data));
    } catch (error) {
      reportError("AdminBlogsPage:loadBlogs", error);
      showNotification("No se pudieron cargar los blogs.", "error");
    } finally {
      setLoadingBlogs(false);
    }
  }, [showNotification]);

  useEffect(() => {
    void loadBlogs();
  }, [loadBlogs]);

  const resetBlogForm = () => {
    setBlogFormState(initialBlogFormState);
    setBlogFormTarget(null);
    setBlogFormImageFile(null);
    setBlogFormLoading(false);
  };

  const openCreateBlogModal = () => {
    setBlogFormMode("create");
    resetBlogForm();
    setBlogFormOpen(true);
  };

  const openEditBlogModal = async (blog: AdminBlog) => {
    setBlogFormMode("edit");
    setBlogFormTarget(blog);
    setBlogFormOpen(true);
    setBlogFormLoading(true);

    try {
      const detail = await getAdminBlogById(blog.id);
      const source = detail ?? blog;
      setBlogFormState({
        title: source.title ?? "",
        author: source.author ?? "",
        summary: source.summary ?? "",
        publishedAt: toDateInputValue(source.publishedAt),
        contentPath: source.contentPath ?? "",
        imagePath: source.imagePath ?? "",
        altText: source.altText ?? "",
      });
    } catch (error) {
      reportError("AdminBlogsPage:loadBlogDetail", error);
      showNotification("No se pudo obtener la información del blog.", "error");
      closeBlogFormModal();
    } finally {
      setBlogFormLoading(false);
    }
  };

  const closeBlogFormModal = () => {
    setBlogFormOpen(false);
    resetBlogForm();
  };

  const handleBlogFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setBlogFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleBlogFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setBlogFormImageFile(file ?? null);
  };

  const validateBlogForm = (): boolean => {
    if (!blogFormState.title.trim() || !blogFormState.author.trim()) {
      showNotification("Título y autor son obligatorios.", "error");
      return false;
    }

    if (!blogFormState.summary.trim()) {
      showNotification("La descripción corta es obligatoria.", "error");
      return false;
    }

    if (!blogFormState.publishedAt) {
      showNotification("Debes indicar la fecha de publicación.", "error");
      return false;
    }

    if (!blogFormState.contentPath.trim()) {
      showNotification("Define una ruta o URL para el contenido.", "error");
      return false;
    }

    if (!blogFormState.imagePath.trim()) {
      showNotification("Debes definir la ruta pública de la imagen principal.", "error");
      return false;
    }

    return true;
  };

  const refreshBlogs = async () => {
    await loadBlogs();
  };

  const handleBlogFormSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validateBlogForm()) {
      return;
    }

    setBlogFormSubmitting(true);

    try {
      if (blogFormMode === "create") {
        const payload: CreateBlogPayload = {
          title: blogFormState.title.trim(),
          author: blogFormState.author.trim(),
          summary: blogFormState.summary.trim(),
          publishedAt: blogFormState.publishedAt,
          contentPath: blogFormState.contentPath.trim(),
          imagePath: blogFormState.imagePath.trim(),
          altText: blogFormState.altText.trim() || undefined,
        };

        await createBlogPost(payload, blogFormImageFile ?? undefined);
        await refreshBlogs();
        showNotification("Blog creado correctamente.", "success");
      } else if (blogFormTarget) {
        const payload: UpdateBlogPayload = {
          title: blogFormState.title.trim(),
          author: blogFormState.author.trim(),
          summary: blogFormState.summary.trim(),
          publishedAt: blogFormState.publishedAt,
          contentPath: blogFormState.contentPath.trim(),
          imagePath: blogFormState.imagePath.trim(),
          altText: blogFormState.altText.trim() || undefined,
        };

        await updateBlogPost(blogFormTarget.id, payload);
        await refreshBlogs();
        showNotification("Blog actualizado correctamente.", "success");
      }

      closeBlogFormModal();
    } catch (error) {
      reportError("AdminBlogsPage:saveBlog", error);
      showNotification("No se pudo guardar el blog.", "error");
    } finally {
      setBlogFormSubmitting(false);
    }
  };

  const openDetailModal = async (blog: AdminBlog) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailBlog(null);

    try {
      const detail = await getAdminBlogById(blog.id);
      setDetailBlog(detail ?? blog);
    } catch (error) {
      reportError("AdminBlogsPage:loadDetailModal", error);
      showNotification("No se pudo cargar el detalle del blog.", "error");
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingBlog(true);
    try {
      await deleteBlogPost(deleteTarget.id);
      setBlogs((current) => current.filter((blog) => blog.id !== deleteTarget.id));
      showNotification("Blog eliminado correctamente.", "success");
      setDeleteTarget(null);
    } catch (error) {
      reportError("AdminBlogsPage:deleteBlog", error);
      showNotification("No se pudo eliminar el blog.", "error");
    } finally {
      setDeletingBlog(false);
    }
  };

  const totalBlogs = blogs.length;
  const latestPublished = useMemo(() => {
    if (!blogs.length) {
      return null;
    }
    const sorted = [...blogs].sort(
      (a, b) => getPublishTimestamp(b.publishedAt) - getPublishTimestamp(a.publishedAt)
    );
    return sorted[0]?.publishedAt ?? null;
  }, [blogs]);

  return (
    <div className={dashboardStyles.dashboardWrapper}>
      <div className="container">
        <header className={`${dashboardStyles.dashboardHeader} mb-4`}>
          <div className={dashboardStyles.headerContent}>
            <p className={dashboardStyles.dashboardEyebrow}>Operaciones de Contenido</p>
            <h1 className={dashboardStyles.dashboardHeadline}>Gestión de Blogs</h1>
            <p className={dashboardStyles.dashboardDescription}>
              Publica novedades, edita artículos existentes y mantén el repositorio sincronizado con S3.
            </p>
          </div>
          <span className={`${dashboardStyles.roleBadge} ${dashboardStyles.roleAdmin}`}>
            Administrador
          </span>
        </header>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeNeutral}`}>
            Total: {totalBlogs}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeHealthy}`}>
            Última publicación: {latestPublished ? formatPublishedDate(latestPublished) : "N/D"}
          </span>
        </div>

        <div className={dashboardStyles.tableCard}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div>
              <p className={dashboardStyles.dashboardEyebrow}>Editorial</p>
              <h2 className={dashboardStyles.tableTitle}>Entradas publicadas</h2>
            </div>
            <button
              type="button"
              className={dashboardStyles.primaryButton}
              onClick={openCreateBlogModal}
            >
              Nuevo blog
            </button>
          </div>

          {loadingBlogs ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" role="status" aria-label="Cargando blogs" />
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-muted mb-0">Todavía no hay entradas registradas.</p>
          ) : (
            <div className={dashboardStyles.tableResponsive}>
              <table className={`table ${dashboardStyles.table}`}>
                <thead>
                  <tr>
                    <th scope="col">Título</th>
                    <th scope="col">Autor</th>
                    <th scope="col">Fecha</th>
                    <th scope="col" className="text-end">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={blog.imageUrl}
                            alt={blog.altText || blog.title}
                            className={dashboardStyles.tableImage}
                            loading="lazy"
                          />
                          <div>
                            <p className="mb-1 fw-semibold">{blog.title}</p>
                            <p className={`${dashboardStyles.helperText} mb-0`}>{blog.summary}</p>
                            <small className={dashboardStyles.helperText}>#{blog.id}</small>
                          </div>
                        </div>
                      </td>
                      <td className={`${dashboardStyles.tableValue} text-white`}>
                        {blog.author}
                      </td>
                      <td className={`${dashboardStyles.tableValue} text-white`}>
                        {formatPublishedDate(blog.publishedAt)}
                      </td>
                      <td>
                        <div className={dashboardStyles.actionGroup}>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => openDetailModal(blog)}
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => openEditBlogModal(blog)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={dashboardStyles.tableAction}
                            onClick={() => setDeleteTarget(blog)}
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

      {blogFormOpen && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>
                    {blogFormMode === "create" ? "Crear blog" : "Editar blog"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={closeBlogFormModal}
                    disabled={blogFormSubmitting}
                  />
                </div>
                <form onSubmit={handleBlogFormSubmit}>
                  <div className="modal-body">
                    {blogFormLoading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-light" role="status" aria-label="Cargando formulario" />
                      </div>
                    ) : (
                      <div className={dashboardStyles.modalFormGrid}>
                        <label className={dashboardStyles.modalFormField}>
                          <span className={dashboardStyles.formLabel}>Título</span>
                          <input
                            className={dashboardStyles.darkField}
                            type="text"
                            name="title"
                            value={blogFormState.title}
                            onChange={handleBlogFieldChange}
                            placeholder="Ej: Lanzamiento nueva consola"
                            required
                          />
                        </label>
                        <label className={dashboardStyles.modalFormField}>
                          <span className={dashboardStyles.formLabel}>Autor</span>
                          <input
                            className={dashboardStyles.darkField}
                            type="text"
                            name="author"
                            value={blogFormState.author}
                            onChange={handleBlogFieldChange}
                            placeholder="Nombre del autor"
                            required
                          />
                        </label>
                        <label className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                          <span className={dashboardStyles.formLabel}>Descripción corta</span>
                          <textarea
                            className={`${dashboardStyles.darkField} ${dashboardStyles.darkTextarea}`}
                            name="summary"
                            value={blogFormState.summary}
                            onChange={handleBlogFieldChange}
                            placeholder="Resumen que aparecerá en las cards públicas"
                            required
                          />
                        </label>
                        <label className={dashboardStyles.modalFormField}>
                          <span className={dashboardStyles.formLabel}>Fecha publicación</span>
                          <input
                            className={dashboardStyles.darkField}
                            type="date"
                            name="publishedAt"
                            value={blogFormState.publishedAt}
                            onChange={handleBlogFieldChange}
                            required
                          />
                        </label>
                        <label className={dashboardStyles.modalFormField}>
                          <span className={dashboardStyles.formLabel}>Ruta/URL contenido</span>
                          <input
                            className={dashboardStyles.darkField}
                            type="text"
                            name="contentPath"
                            value={blogFormState.contentPath}
                            onChange={handleBlogFieldChange}
                            placeholder="blogs/123/blog.md o https://..."
                            required
                          />
                          <small className={dashboardStyles.helperText}>
                            Usa la convención blogs/{'{'}id{'}'}/blog.md para mantener la migración automática.
                          </small>
                        </label>
                        <label className={dashboardStyles.modalFormField}>
                          <span className={dashboardStyles.formLabel}>Ruta imagen principal</span>
                          <input
                            className={dashboardStyles.darkField}
                            type="text"
                            name="imagePath"
                            value={blogFormState.imagePath}
                            onChange={handleBlogFieldChange}
                            placeholder="blogs/123/blog.jpg"
                            required
                          />
                        </label>
                        <label className={dashboardStyles.modalFormField}>
                          <span className={dashboardStyles.formLabel}>Texto alternativo</span>
                          <input
                            className={dashboardStyles.darkField}
                            type="text"
                            name="altText"
                            value={blogFormState.altText}
                            onChange={handleBlogFieldChange}
                            placeholder="Describe la imagen para accesibilidad"
                          />
                        </label>
                        {blogFormMode === "create" && (
                          <label className={dashboardStyles.modalFormField}>
                            <span className={dashboardStyles.formLabel}>Imagen principal (upload)</span>
                            <input
                              className={`${dashboardStyles.darkField} ${dashboardStyles.fileInput}`}
                              type="file"
                              accept="image/*"
                              onChange={handleBlogFileChange}
                            />
                            <small className={dashboardStyles.helperText}>
                              Opcional: se enviará junto al payload y el backend lo subirá al bucket configurado.
                            </small>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                    <div className={dashboardStyles.modalActions}>
                      <button
                        type="button"
                        className={dashboardStyles.ghostButton}
                        onClick={closeBlogFormModal}
                        disabled={blogFormSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={dashboardStyles.primaryButton}
                        disabled={blogFormSubmitting}
                      >
                        {blogFormMode === "create" ? "Publicar" : "Guardar"}
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
                    Detalle del blog
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => {
                      setDetailModalOpen(false);
                      setDetailBlog(null);
                    }}
                  />
                </div>
                <div className="modal-body">
                  {detailLoading || !detailBlog ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-light" role="status" aria-label="Cargando detalle" />
                    </div>
                  ) : (
                    <div className="row g-3">
                      <div className="col-12">
                        <img
                          src={detailBlog.imageUrl}
                          alt={detailBlog.altText || detailBlog.title}
                          className="img-fluid rounded"
                        />
                      </div>
                      <div className="col-md-6">
                        <p className={dashboardStyles.formLabel}>Autor</p>
                        <p className="mb-0">{detailBlog.author}</p>
                      </div>
                      <div className="col-md-6">
                        <p className={dashboardStyles.formLabel}>Publicado</p>
                        <p className="mb-0">{formatPublishedDate(detailBlog.publishedAt)}</p>
                      </div>
                      <div className="col-12">
                        <p className={dashboardStyles.formLabel}>Descripción</p>
                        <p>{detailBlog.summary}</p>
                      </div>
                      <div className="col-md-6">
                        <p className={dashboardStyles.formLabel}>Contenido</p>
                        <p className={dashboardStyles.helperText}>{detailBlog.contentPath || "N/A"}</p>
                      </div>
                      <div className="col-md-6">
                        <p className={dashboardStyles.formLabel}>Imagen</p>
                        <p className={dashboardStyles.helperText}>{detailBlog.imagePath || "N/A"}</p>
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
                      setDetailBlog(null);
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
                    Eliminar blog
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deletingBlog}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    ¿Seguro que deseas eliminar <span className="fw-semibold">{deleteTarget.title}</span>?
                  </p>
                  <p className={dashboardStyles.helperText}>Esta acción no se puede deshacer.</p>
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <div className={dashboardStyles.modalActions}>
                    <button
                      type="button"
                      className={dashboardStyles.ghostButton}
                      onClick={() => setDeleteTarget(null)}
                      disabled={deletingBlog}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={dashboardStyles.dangerButton}
                      onClick={handleDeleteBlog}
                      disabled={deletingBlog}
                    >
                      Eliminar
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
