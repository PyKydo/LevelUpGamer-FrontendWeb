import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type SyntheticEvent } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  sortProductsByIdAndName,
  updateProduct,
  type CreateProductPayload,
  type Product,
} from "../../helpers/api.helper";
import { formatCurrency } from "../../helpers/formatting.helper";
import { reportError } from "../../helpers/logging.helper";
import { useNotification } from "../../hooks/useNotification";
import { useProductCategories } from "../../hooks/useProductCategories";
import dashboardStyles from "../dashboard/Dashboard.module.css";

const FALLBACK_IMAGE = "https://placehold.co/80x80?text=Producto";

type ProductFormMode = "create" | "edit";

interface ProductFormState {
  code: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: string;
  stock: string;
  stockCritical: string;
  pointsLevelUp: string;
  active: boolean;
}

const initialProductFormState: ProductFormState = {
  code: "",
  name: "",
  description: "",
  categoryId: "",
  categoryName: "",
  price: "",
  stock: "",
  stockCritical: "",
  pointsLevelUp: "",
  active: true,
};

const parseOptionalNumber = (value: string): number | undefined => {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const SellerProductsPage = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const {
    categories,
    loading: loadingCategories,
    error: categoriesError,
  } = useProductCategories();

  const resolveCategoryIdByName = (categoryName?: string): string => {
    if (!categoryName?.trim()) {
      return "";
    }
    const normalized = categoryName.trim().toLowerCase();
    const match = categories.find((category) => {
      const candidateName = category.name?.trim().toLowerCase();
      const candidateCode = category.code?.trim().toLowerCase();
      return candidateName === normalized || candidateCode === normalized;
    });
    return match?.id?.toString() ?? "";
  };

  const [productFormMode, setProductFormMode] = useState<ProductFormMode>("create");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productFormState, setProductFormState] = useState<ProductFormState>(
    initialProductFormState
  );
  const [productFormImage, setProductFormImage] = useState<File | null>(null);
  const [productFormTarget, setProductFormTarget] = useState<Product | null>(null);
  const [productFormSubmitting, setProductFormSubmitting] = useState(false);

  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        label: category.name ?? category.code ?? "Categoría sin nombre",
      })),
    [categories]
  );

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await getProducts({ includeInactive: true });
        if (isMounted) {
          setProducts(sortProductsByIdAndName(data));
        }
      } catch (error) {
        reportError("SellerProductsPage:loadProducts", error);
        if (isMounted) {
          showNotification("No se pudieron cargar tus productos.", "error");
        }
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [showNotification]);

  useEffect(() => {
    if (categoriesError) {
      showNotification("No se pudieron cargar las categorías.", "error");
    }
  }, [categoriesError, showNotification]);

  useEffect(() => {
    if (!productFormOpen) {
      return;
    }
    if (!productFormState.categoryName?.trim()) {
      return;
    }
    const hasNumericCategoryId =
      Boolean(productFormState.categoryId) &&
      /^\d+$/.test(productFormState.categoryId.trim());
    if (hasNumericCategoryId) {
      return;
    }

    const normalized = productFormState.categoryName.trim().toLowerCase();
    const match = categories.find((category) => {
      const candidateName = category.name?.trim().toLowerCase();
      const candidateCode = category.code?.trim().toLowerCase();
      return candidateName === normalized || candidateCode === normalized;
    });

    if (match?.id) {
      setProductFormState((current) => ({
        ...current,
        categoryId: match.id.toString(),
      }));
    }
  }, [categories, productFormOpen, productFormState.categoryId, productFormState.categoryName]);

  const totalProducts = products.length;
  const activeProducts = useMemo(
    () => products.filter((product) => product.active !== false).length,
    [products]
  );
  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= (product.stockCritical ?? 5)).length,
    [products]
  );

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  const resetProductForm = () => {
    setProductFormState(initialProductFormState);
    setProductFormTarget(null);
    setProductFormImage(null);
  };

  const openCreateProductModal = () => {
    setProductFormMode("create");
    resetProductForm();
    setProductFormOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setProductFormMode("edit");
    setProductFormTarget(product);
    const matchedCategoryId =
      product.categoryId?.toString() || resolveCategoryIdByName(product.category);
    setProductFormState({
      code: product.code ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      categoryId: matchedCategoryId,
      categoryName: product.category ?? "",
      price: product.price?.toString() ?? "",
      stock: product.stock?.toString() ?? "",
      stockCritical: product.stockCritical?.toString() ?? "",
      pointsLevelUp: product.pointsLevelUp?.toString() ?? "",
      active: product.active !== false,
    });
    setProductFormOpen(true);
  };

  const closeProductFormModal = () => {
    setProductFormOpen(false);
    resetProductForm();
  };

  const handleProductFormFieldChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = event.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value } = target;

    if (name === "categoryId") {
      const selectedLabel =
        target instanceof HTMLSelectElement
          ? target.selectedOptions?.[0]?.text ?? ""
          : "";
      setProductFormState((current) => ({
        ...current,
        categoryId: value,
        categoryName: value ? selectedLabel : "",
      }));
      return;
    }

    const nextValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : value;

    setProductFormState((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const handleProductFormImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setProductFormImage(file ?? null);
  };

  const handleProductFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productFormState.name.trim() || !productFormState.code.trim()) {
      showNotification("Nombre y código son obligatorios.", "error");
      return;
    }

    if (!productFormState.price.trim() || !productFormState.stock.trim()) {
      showNotification("Precio y stock son obligatorios.", "error");
      return;
    }

    if (!productFormState.categoryId) {
      showNotification("Debes seleccionar una categoría.", "error");
      return;
    }

    const price = Number(productFormState.price);
    const stock = Number(productFormState.stock);
    const categoryId = Number(productFormState.categoryId);

    if (Number.isNaN(price) || Number.isNaN(stock)) {
      showNotification("Precio y stock deben ser numéricos.", "error");
      return;
    }

    if (Number.isNaN(categoryId)) {
      showNotification("La categoría seleccionada es inválida.", "error");
      return;
    }

    const matchedCategory = categories.find(
      (category) => category.id?.toString() === productFormState.categoryId
    );
    const selectedCategoryName =
      productFormState.categoryName?.trim() ||
      matchedCategory?.name?.trim() ||
      matchedCategory?.code?.trim() ||
      "";

    const commonPayload: CreateProductPayload = {
      code: productFormState.code.trim(),
      name: productFormState.name.trim(),
      description: productFormState.description.trim(),
      categoryId,
      category: selectedCategoryName,
      price,
      stock,
      stockCritical: parseOptionalNumber(productFormState.stockCritical),
      pointsLevelUp: parseOptionalNumber(productFormState.pointsLevelUp),
      active: productFormState.active,
    };

    setProductFormSubmitting(true);
    try {
      if (productFormMode === "create") {
        const createdProduct = await createProduct(
          commonPayload,
          productFormImage ?? undefined
        );
        setProducts((current) =>
          sortProductsByIdAndName([...(current ?? []), createdProduct])
        );
        showNotification("Producto publicado correctamente.", "success");
      } else if (productFormTarget) {
        const updatedProduct = await updateProduct(productFormTarget.id, {
          name: commonPayload.name,
          description: commonPayload.description,
          category: commonPayload.category,
          categoryId: commonPayload.categoryId,
          price: commonPayload.price,
          stock: commonPayload.stock,
          stockCritical: commonPayload.stockCritical,
          pointsLevelUp: commonPayload.pointsLevelUp,
          active: commonPayload.active,
        });

        if (updatedProduct) {
          setProducts((current) =>
            sortProductsByIdAndName(
              current.map((product) =>
                product.id === updatedProduct.id ? updatedProduct : product
              )
            )
          );
          showNotification("Producto actualizado correctamente.", "success");
        }
      }
      closeProductFormModal();
    } catch (error) {
      reportError("SellerProductsPage:saveProduct", error);
      showNotification("No se pudo guardar el producto.", "error");
    } finally {
      setProductFormSubmitting(false);
    }
  };

  const openDetailModal = (product: Product) => {
    setDetailProduct(product);
  };

  const closeDetailModal = () => {
    setDetailProduct(null);
  };

  const openDeleteModal = (product: Product) => {
    setDeleteTarget(product);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeletingProduct(false);
  };

  const handleDeleteProduct = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingProduct(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((current) =>
        sortProductsByIdAndName(
          current.filter((product) => product.id !== deleteTarget.id)
        )
      );
      showNotification("Producto eliminado correctamente.", "success");
      closeDeleteModal();
    } catch (error) {
      reportError("SellerProductsPage:deleteProduct", error);
      showNotification("No se pudo eliminar el producto.", "error");
      setDeletingProduct(false);
    }
  };

  return (
    <div className={dashboardStyles.dashboardWrapper}>
      <div className="container">
        <header className={`${dashboardStyles.dashboardHeader} mb-4`}>
          <div className={dashboardStyles.headerContent}>
            <p className={dashboardStyles.dashboardEyebrow}>Inventario personal</p>
            <h1 className={dashboardStyles.dashboardHeadline}>Mis productos</h1>
            <p className={dashboardStyles.dashboardDescription}>
              Crea, actualiza o retira productos de tu catálogo. Los cambios se
              reflejan de inmediato para tus clientes.
            </p>
          </div>
          <span className={`${dashboardStyles.roleBadge} ${dashboardStyles.roleSeller}`}>
            Vendedor
          </span>
        </header>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeHealthy}`}>
            Activos: {activeProducts}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeNeutral}`}>
            Total catálogo: {totalProducts}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeLowStock}`}>
            Stock crítico: {lowStockProducts}
          </span>
        </div>

        <div className={dashboardStyles.tableCard}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div>
              <p className={dashboardStyles.dashboardEyebrow}>Control de catálogo</p>
              <h2 className={dashboardStyles.tableTitle}>Inventario publicado</h2>
            </div>
            <button
              type="button"
              className={dashboardStyles.primaryButton}
              onClick={openCreateProductModal}
            >
              Crear producto
            </button>
          </div>

          {loadingProducts ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" role="status" aria-label="Cargando productos" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted mb-0">Aún no has publicado productos.</p>
          ) : (
            <div className={dashboardStyles.tableResponsive}>
              <table className={`table ${dashboardStyles.table}`}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Código</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isLowStock = product.stock <= (product.stockCritical ?? 5);
                    const stockBadge = isLowStock
                      ? dashboardStyles.badgeLowStock
                      : dashboardStyles.badgeHealthy;
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={product.image || FALLBACK_IMAGE}
                              alt={product.name}
                              className={dashboardStyles.tableImage}
                              loading="lazy"
                              onError={handleImageError}
                            />
                            <div>
                              <p className="mb-0 text-white fw-semibold">{product.name}</p>
                              <small className={dashboardStyles.helperText}>#{product.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`${dashboardStyles.tableValue} ${dashboardStyles.tableCode}`}>
                            {product.code}
                          </span>
                        </td>
                        <td>
                          <span className={`${dashboardStyles.tableBadge} ${dashboardStyles.badgeNeutral}`}>
                            {product.category || "Sin categoría"}
                          </span>
                        </td>
                        <td>
                          <span className={`${dashboardStyles.tableValue} ${dashboardStyles.tablePrice}`}>
                            {formatCurrency(product.price ?? 0)}
                          </span>
                        </td>
                        <td>
                          <span className={`${dashboardStyles.tableBadge} ${stockBadge}`}>
                            {product.stock} ud.
                          </span>
                        </td>
                        <td>
                          <span className={`${dashboardStyles.tableBadge} ${product.active === false ? dashboardStyles.badgeLowStock : dashboardStyles.badgeHealthy}`}>
                            {product.active === false ? "Inactivo" : "Activo"}
                          </span>
                        </td>
                        <td>
                          <div className={dashboardStyles.actionGroup}>
                            <button
                              type="button"
                              className={dashboardStyles.tableAction}
                              onClick={() => openDetailModal(product)}
                            >
                              Ver
                            </button>
                            <button
                              type="button"
                              className={dashboardStyles.tableAction}
                              onClick={() => openEditProductModal(product)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className={dashboardStyles.tableAction}
                              onClick={() => openDeleteModal(product)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {productFormOpen && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>
                    {productFormMode === "create" ? "Crear producto" : "Editar producto"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={closeProductFormModal}
                    disabled={productFormSubmitting}
                  />
                </div>
                <form onSubmit={handleProductFormSubmit}>
                  <div className="modal-body">
                    <div className={dashboardStyles.modalFormGrid}>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="seller-product-code">
                          Código
                        </label>
                        <input
                          id="seller-product-code"
                          name="code"
                          type="text"
                          className={dashboardStyles.darkField}
                          value={productFormState.code}
                          onChange={handleProductFormFieldChange}
                          required
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="seller-product-name">
                          Nombre
                        </label>
                        <input
                          id="seller-product-name"
                          name="name"
                          type="text"
                          className={dashboardStyles.darkField}
                          value={productFormState.name}
                          onChange={handleProductFormFieldChange}
                          required
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="seller-product-category">
                          Categoría
                        </label>
                        <select
                          id="seller-product-category"
                          name="categoryId"
                          className={dashboardStyles.darkField}
                          value={productFormState.categoryId}
                          onChange={handleProductFormFieldChange}
                          disabled={loadingCategories}
                        >
                          <option value="">
                            {loadingCategories
                              ? "Cargando categorías..."
                              : "Selecciona una categoría"}
                          </option>
                          {categoryOptions.map((option) => (
                            <option key={option.id} value={option.id?.toString() ?? ""}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {!loadingCategories && categoryOptions.length === 0 && (
                          <small className={dashboardStyles.helperText}>
                            No tienes categorías activas disponibles. Crea una nueva desde tu panel administrador.
                          </small>
                        )}
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="seller-product-price">
                          Precio
                        </label>
                        <input
                          id="seller-product-price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          className={dashboardStyles.darkField}
                          value={productFormState.price}
                          onChange={handleProductFormFieldChange}
                          required
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="seller-product-stock">
                          Stock
                        </label>
                        <input
                          id="seller-product-stock"
                          name="stock"
                          type="number"
                          min="0"
                          className={dashboardStyles.darkField}
                          value={productFormState.stock}
                          onChange={handleProductFormFieldChange}
                          required
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="seller-product-stock-critical">
                          Stock crítico
                        </label>
                        <input
                          id="seller-product-stock-critical"
                          name="stockCritical"
                          type="number"
                          min="0"
                          className={dashboardStyles.darkField}
                          value={productFormState.stockCritical}
                          onChange={handleProductFormFieldChange}
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="seller-product-points">
                          Puntos LevelUp
                        </label>
                        <input
                          id="seller-product-points"
                          name="pointsLevelUp"
                          type="number"
                          min="0"
                          className={dashboardStyles.darkField}
                          value={productFormState.pointsLevelUp}
                          onChange={handleProductFormFieldChange}
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="seller-product-image">
                          Imagen (opcional)
                        </label>
                        <input
                          id="seller-product-image"
                          type="file"
                          accept="image/*"
                          className={`${dashboardStyles.darkField} ${dashboardStyles.fileInput}`}
                          onChange={handleProductFormImageChange}
                        />
                      </div>
                      <div className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                        <label className={dashboardStyles.formLabel} htmlFor="seller-product-description">
                          Descripción
                        </label>
                        <textarea
                          id="seller-product-description"
                          name="description"
                          className={`${dashboardStyles.darkField} ${dashboardStyles.darkTextarea}`}
                          value={productFormState.description}
                          onChange={handleProductFormFieldChange}
                        />
                      </div>
                      <div className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                        <div className={`form-check form-switch ${dashboardStyles.switchField}`}>
                          <input
                            id="seller-product-active"
                            className="form-check-input"
                            type="checkbox"
                            name="active"
                            checked={productFormState.active}
                            onChange={handleProductFormFieldChange}
                          />
                          <label
                            className={`form-check-label ${dashboardStyles.switchLabel}`}
                            htmlFor="seller-product-active"
                          >
                            Producto activo en catálogo
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
                        onClick={closeProductFormModal}
                        disabled={productFormSubmitting}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className={dashboardStyles.primaryButton}
                        disabled={productFormSubmitting}
                      >
                        {productFormSubmitting
                          ? "Guardando..."
                          : productFormMode === "create"
                          ? "Crear producto"
                          : "Actualizar producto"}
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

      {detailProduct && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>
                    Detalle del producto
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={closeDetailModal}
                  />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <p className="mb-1 text-muted">Código</p>
                      <p className="text-white fw-semibold">{detailProduct.code}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1 text-muted">Categoría</p>
                      <p className="text-white fw-semibold">{detailProduct.category || "Sin categoría"}</p>
                    </div>
                    <div className="col-md-4">
                      <p className="mb-1 text-muted">Precio</p>
                      <p className="text-white fw-semibold">{formatCurrency(detailProduct.price ?? 0)}</p>
                    </div>
                    <div className="col-md-4">
                      <p className="mb-1 text-muted">Stock</p>
                      <p className="text-white fw-semibold">{detailProduct.stock} ud.</p>
                    </div>
                    <div className="col-md-4">
                      <p className="mb-1 text-muted">Stock crítico</p>
                      <p className="text-white fw-semibold">{detailProduct.stockCritical ?? "No definido"}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1 text-muted">Estado</p>
                      <p className="text-white fw-semibold">
                        {detailProduct.active === false ? "Inactivo" : "Activo"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1 text-muted">Puntos LevelUp</p>
                      <p className="text-white fw-semibold">{detailProduct.pointsLevelUp ?? 0}</p>
                    </div>
                    <div className="col-12">
                      <p className="mb-1 text-muted">Descripción</p>
                      <p className={dashboardStyles.helperText}>
                        {detailProduct.description || "Sin descripción registrada."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <button
                    type="button"
                    className={dashboardStyles.primaryButton}
                    onClick={closeDetailModal}
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
                    Eliminar producto
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={closeDeleteModal}
                    disabled={deletingProduct}
                  />
                </div>
                <div className="modal-body">
                  <p>
                    ¿Seguro que deseas eliminar
                    {" "}
                    <span className="fw-semibold">{deleteTarget.name}</span>?
                  </p>
                  <p className={dashboardStyles.helperText}>
                    Esta acción no se puede deshacer y el producto dejará de estar disponible para tus clientes.
                  </p>
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <div className={dashboardStyles.modalActions}>
                    <button
                      type="button"
                      className={dashboardStyles.ghostButton}
                      onClick={closeDeleteModal}
                      disabled={deletingProduct}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={dashboardStyles.dangerButton}
                      onClick={handleDeleteProduct}
                      disabled={deletingProduct}
                    >
                      {deletingProduct ? "Eliminando..." : "Eliminar"}
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
