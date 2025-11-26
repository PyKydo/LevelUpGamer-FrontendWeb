import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, SyntheticEvent } from "react";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getSellers,
  sortProductsByIdAndName,
  updateProduct,
  type CreateProductPayload,
  type Product,
  type UserSummary,
} from "../../helpers/api.helper";
import { formatCurrency } from "../../helpers/formatting.helper";
import { useNotification } from "../../hooks/useNotification";
import dashboardStyles from "../dashboard/Dashboard.module.css";

const CORPORATE_OWNER_VALUE = "corporate";

const resolveSellerValue = (product: Product | null): string => {
  if (!product?.seller || product.seller.corporate) {
    return CORPORATE_OWNER_VALUE;
  }
  return product.seller.id.toString();
};

type ProductFormMode = "create" | "edit";

interface ProductFormState {
  code: string;
  name: string;
  description: string;
  category: string;
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
  category: "",
  price: "",
  stock: "",
  stockCritical: "",
  pointsLevelUp: "",
  active: true,
};

export const AdminProductsPage = () => {
  const { showNotification } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sellers, setSellers] = useState<UserSummary[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSellerValue, setSelectedSellerValue] = useState<string>(
    CORPORATE_OWNER_VALUE
  );
  const [savingOwner, setSavingOwner] = useState(false);
  const fallbackImage = "https://placehold.co/80x80?text=Producto";
  const [productFormMode, setProductFormMode] = useState<ProductFormMode>("create");
  const [productFormState, setProductFormState] = useState<ProductFormState>(
    initialProductFormState
  );
  const [productFormImage, setProductFormImage] = useState<File | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productFormSubmitting, setProductFormSubmitting] = useState(false);
  const [productFormTarget, setProductFormTarget] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const resetProductForm = () => {
    setProductFormState(initialProductFormState);
    setProductFormImage(null);
    setProductFormTarget(null);
  };

  const openCreateProductModal = () => {
    setProductFormMode("create");
    resetProductForm();
    setProductFormOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setProductFormMode("edit");
    setProductFormTarget(product);
    setProductFormState({
      code: product.code ?? "",
      name: product.name ?? "",
      description: product.description ?? "",
      category: product.category ?? "",
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
    const nextValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : value;
    setProductFormState((current) => ({
      ...current,
      [name]: nextValue,
    }));
  };

  const handleProductFormImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    setProductFormImage(file ?? null);
  };

  const parseOptionalNumber = (value: string): number | undefined => {
    if (!value?.trim()) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const handleProductFormSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!productFormState.name.trim() || !productFormState.code.trim()) {
      showNotification("Nombre y código son obligatorios.", "error");
      return;
    }

    if (!productFormState.price.trim() || !productFormState.stock.trim()) {
      showNotification("Precio y stock son obligatorios.", "error");
      return;
    }

    const price = Number(productFormState.price);
    const stock = Number(productFormState.stock);

    if (Number.isNaN(price) || Number.isNaN(stock)) {
      showNotification("Precio y stock deben ser numéricos.", "error");
      return;
    }

    const commonPayload: CreateProductPayload = {
      code: productFormState.code.trim(),
      name: productFormState.name.trim(),
      description: productFormState.description.trim(),
      category: productFormState.category.trim(),
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
          sortProductsByIdAndName([...current, createdProduct])
        );
        showNotification("Producto creado correctamente.", "success");
      } else if (productFormTarget) {
        const updatedProduct = await updateProduct(productFormTarget.id, {
          name: commonPayload.name,
          description: commonPayload.description,
          category: commonPayload.category,
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
      console.error("Error saving product:", error);
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
      console.error("Error deleting product:", error);
      showNotification("No se pudo eliminar el producto.", "error");
      setDeletingProduct(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        if (isMounted) {
          setProducts(sortProductsByIdAndName(data));
        }
      } catch (error) {
        console.error("Error loading products:", error);
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadSellers = async () => {
      try {
        const data = await getSellers();
        if (isMounted) {
          setSellers(data);
        }
      } catch (error) {
        console.error("Error loading sellers:", error);
      } finally {
        if (isMounted) {
          setLoadingSellers(false);
        }
      }
    };

    void loadSellers();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalProducts = products.length;
  const activeProducts = useMemo(
    () => products.filter((product) => product.active !== false).length,
    [products]
  );
  const corporateProducts = useMemo(
    () => products.filter((product) => product.seller?.corporate).length,
    [products]
  );

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = fallbackImage;
  };

  const openOwnerModal = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSellerValue(resolveSellerValue(product));
    setModalOpen(true);
  };

  const closeOwnerModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    setSelectedSellerValue(CORPORATE_OWNER_VALUE);
  };

  const handleOwnerSave = async () => {
    if (!selectedProduct) {
      return;
    }

    const sellerId =
      selectedSellerValue === CORPORATE_OWNER_VALUE
        ? null
        : Number(selectedSellerValue);

    setSavingOwner(true);
    try {
      const updatedProduct = await updateProduct(selectedProduct.id, {
        sellerId,
      });

      if (!updatedProduct) {
        showNotification("No se pudo actualizar el producto.", "error");
        return;
      }

      setProducts((current) =>
        sortProductsByIdAndName(
          current.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          )
        )
      );
      showNotification("Producto actualizado correctamente.", "success");
      closeOwnerModal();
    } catch (error) {
      console.error("Error updating product owner:", error);
      showNotification("No se pudo actualizar el dueño del producto.", "error");
    } finally {
      setSavingOwner(false);
    }
  };

  const sellerOptions = useMemo(
    () =>
      sellers.map((seller) => ({
        value: seller.id.toString(),
        label: `${seller.fullName} (${seller.email})`,
      })),
    [sellers]
  );

  const selectedProductSellerValue = resolveSellerValue(selectedProduct);
  const hasOwnerChanges = selectedSellerValue !== selectedProductSellerValue;

  return (
    <div className={dashboardStyles.dashboardWrapper}>
      <div className="container">
        <header className={`${dashboardStyles.dashboardHeader} mb-4`}>
          <div className={dashboardStyles.headerContent}>
            <p className={dashboardStyles.dashboardEyebrow}>Control de catálogo</p>
            <h1 className={dashboardStyles.dashboardHeadline}>Gestión de Productos</h1>
            <p className={dashboardStyles.dashboardDescription}>
              Revisa el inventario completo y reasigna propietarios cuando se
              requiera continuidad operacional.
            </p>
          </div>
          <span className={`${dashboardStyles.roleBadge} ${dashboardStyles.roleAdmin}`}>
            Administrador
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
            Corporativos: {corporateProducts}
          </span>
        </div>

        <div className={dashboardStyles.tableCard}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div>
              <p className={dashboardStyles.dashboardEyebrow}>Inventario global</p>
              <h2 className={dashboardStyles.tableTitle}>Productos registrados</h2>
            </div>
            <button
              type="button"
              className={dashboardStyles.primaryButton}
              onClick={openCreateProductModal}
            >
              Nuevo producto
            </button>
          </div>

          {loadingProducts ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" role="status" aria-label="Cargando productos" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted mb-0">No hay productos registrados todavía.</p>
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
                    <th>Vendedor</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isLowStock = product.stock <= (product.stockCritical ?? 5);
                    const stockBadge = isLowStock
                      ? dashboardStyles.badgeLowStock
                      : dashboardStyles.badgeHealthy;
                    const sellerBadge = product.seller?.corporate
                      ? dashboardStyles.badgeNeutral
                      : dashboardStyles.badgeHealthy;

                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={product.image || fallbackImage}
                              alt={product.name}
                              className={dashboardStyles.tableImage}
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
                            {product.category}
                          </span>
                        </td>
                        <td>
                          <span className={`${dashboardStyles.tableValue} ${dashboardStyles.tablePrice}`}>
                            {formatCurrency(product.price)}
                          </span>
                        </td>
                        <td>
                          <span className={`${dashboardStyles.tableBadge} ${stockBadge}`}>
                            {product.stock} ud.
                          </span>
                        </td>
                        <td>
                          <div>
                            <span className={`${dashboardStyles.tableBadge} ${sellerBadge}`}>
                              {product.seller?.name ?? "LevelUp"}
                            </span>
                            <small className={`d-block ${dashboardStyles.helperText}`}>
                              {product.seller?.corporate
                                ? "Corporativo"
                                : product.seller?.email ?? "Sin correo"}
                            </small>
                          </div>
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
                            <button
                              type="button"
                              className={dashboardStyles.tableAction}
                              onClick={() => openOwnerModal(product)}
                            >
                              Dueño
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
                        <label className={dashboardStyles.formLabel} htmlFor="product-code">
                          Código
                        </label>
                        <input
                          id="product-code"
                          name="code"
                          type="text"
                          className={dashboardStyles.darkField}
                          value={productFormState.code}
                          onChange={handleProductFormFieldChange}
                          required
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="product-name">
                          Nombre
                        </label>
                        <input
                          id="product-name"
                          name="name"
                          type="text"
                          className={dashboardStyles.darkField}
                          value={productFormState.name}
                          onChange={handleProductFormFieldChange}
                          required
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="product-category">
                          Categoría
                        </label>
                        <input
                          id="product-category"
                          name="category"
                          type="text"
                          className={dashboardStyles.darkField}
                          value={productFormState.category}
                          onChange={handleProductFormFieldChange}
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="product-price">
                          Precio
                        </label>
                        <input
                          id="product-price"
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
                        <label className={dashboardStyles.formLabel} htmlFor="product-stock">
                          Stock
                        </label>
                        <input
                          id="product-stock"
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
                        <label className={dashboardStyles.formLabel} htmlFor="product-stock-critical">
                          Stock crítico
                        </label>
                        <input
                          id="product-stock-critical"
                          name="stockCritical"
                          type="number"
                          min="0"
                          className={dashboardStyles.darkField}
                          value={productFormState.stockCritical}
                          onChange={handleProductFormFieldChange}
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="product-points">
                          Puntos LevelUp
                        </label>
                        <input
                          id="product-points"
                          name="pointsLevelUp"
                          type="number"
                          min="0"
                          className={dashboardStyles.darkField}
                          value={productFormState.pointsLevelUp}
                          onChange={handleProductFormFieldChange}
                        />
                      </div>
                      <div className={dashboardStyles.modalFormField}>
                        <label className={dashboardStyles.formLabel} htmlFor="product-image">
                          Imagen (opcional)
                        </label>
                        <input
                          id="product-image"
                          type="file"
                          accept="image/*"
                          className={`${dashboardStyles.darkField} ${dashboardStyles.fileInput}`}
                          onChange={handleProductFormImageChange}
                          disabled={productFormMode === "edit"}
                        />
                        {productFormMode === "edit" && (
                          <small className={dashboardStyles.helperText}>
                            La imagen solo se puede actualizar mediante soporte técnico.
                          </small>
                        )}
                      </div>
                      <div className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                        <label className={dashboardStyles.formLabel} htmlFor="product-description">
                          Descripción
                        </label>
                        <textarea
                          id="product-description"
                          name="description"
                          className={`${dashboardStyles.darkField} ${dashboardStyles.darkTextarea}`}
                          value={productFormState.description}
                          onChange={handleProductFormFieldChange}
                        />
                      </div>
                      <div className={`${dashboardStyles.modalFormField} ${dashboardStyles.modalFormFieldFull}`}>
                        <div className={`form-check form-switch ${dashboardStyles.switchField}`}>
                          <input
                            id="product-active"
                            className="form-check-input"
                            type="checkbox"
                            name="active"
                            checked={productFormState.active}
                            onChange={handleProductFormFieldChange}
                          />
                          <label className={`form-check-label ${dashboardStyles.switchLabel}`} htmlFor="product-active">
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
                    Detalle de producto
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
                      <p className="text-white fw-semibold">{formatCurrency(detailProduct.price)}</p>
                    </div>
                    <div className="col-md-4">
                      <p className="mb-1 text-muted">Stock</p>
                      <p className="text-white fw-semibold">{detailProduct.stock} ud.</p>
                    </div>
                    <div className="col-md-4">
                      <p className="mb-1 text-muted">Stock crítico</p>
                      <p className="text-white fw-semibold">{detailProduct.stockCritical ?? "No definido"}</p>
                    </div>
                    <div className="col-12">
                      <p className="mb-1 text-muted">Descripción</p>
                      <p className={dashboardStyles.helperText}>
                        {detailProduct.description || "Sin descripción registrada."}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1 text-muted">Estado</p>
                      <p className="text-white fw-semibold">
                        {detailProduct.active === false ? "Inactivo" : "Activo"}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1 text-muted">Vendedor</p>
                      <p className="text-white fw-semibold">
                        {detailProduct.seller?.name ?? "LevelUp"}
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
                    Esta acción no se puede deshacer y el producto dejará de estar disponible en el catálogo.
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

      {modalOpen && selectedProduct && (
        <>
          <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={`modal-title ${dashboardStyles.modalTitle}`}>Reasignar producto</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={closeOwnerModal}
                    disabled={savingOwner}
                  />
                </div>
                <div className="modal-body">
                  <p className={dashboardStyles.helperText}>{selectedProduct.name}</p>
                  <p className={dashboardStyles.helperText}>Código: {selectedProduct.code}</p>

                  <div className="mb-3">
                    <label htmlFor="seller-select" className={dashboardStyles.formLabel}>
                      Asignar a
                    </label>
                    <select
                      id="seller-select"
                      className={`form-select ${dashboardStyles.darkField} ${dashboardStyles.darkSelect}`}
                      value={selectedSellerValue}
                      onChange={(event) => setSelectedSellerValue(event.target.value)}
                      disabled={savingOwner}
                    >
                      <option value={CORPORATE_OWNER_VALUE}>LevelUp (Corporativo)</option>
                      {sellerOptions.map((seller) => (
                        <option key={seller.value} value={seller.value}>
                          {seller.label}
                        </option>
                      ))}
                    </select>
                    {loadingSellers ? (
                      <small className={dashboardStyles.helperText}>Cargando vendedores...</small>
                    ) : sellerOptions.length === 0 ? (
                      <small className={dashboardStyles.helperText}>No hay vendedores disponibles todavía.</small>
                    ) : (
                      <small className={dashboardStyles.helperText}>
                        Selecciona un vendedor activo o vuelve a marcarlo como corporativo.
                      </small>
                    )}
                  </div>
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <div className={dashboardStyles.modalActions}>
                    <button
                      type="button"
                      className={dashboardStyles.ghostButton}
                      onClick={closeOwnerModal}
                      disabled={savingOwner}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className={dashboardStyles.primaryButton}
                      onClick={handleOwnerSave}
                      disabled={!hasOwnerChanges || savingOwner}
                    >
                      {savingOwner ? "Guardando..." : "Guardar cambios"}
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
