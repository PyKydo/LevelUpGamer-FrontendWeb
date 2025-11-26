import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  getProducts,
  getUsers,
  sortUsersByName,
  updateOrderStatus,
  type CreateOrderPayload,
  type Order,
  type Product,
  type UserSummary,
} from "../../helpers/api.helper";
import { formatCurrency } from "../../helpers/formatting.helper";
import { useNotification } from "../../hooks/useNotification";
import dashboardStyles from "../dashboard/Dashboard.module.css";

const ORDER_STATUS_ALLOWED = [
  "PENDIENTE",
  "PAGADO",
  "ENVIADO",
  "CANCELADO",
] as const;

type AllowedOrderStatus = (typeof ORDER_STATUS_ALLOWED)[number];

const DEFAULT_ORDER_STATUS: AllowedOrderStatus = ORDER_STATUS_ALLOWED[0];

const normalizeAllowedStatus = (value?: string): AllowedOrderStatus => {
  if (!value) {
    return DEFAULT_ORDER_STATUS;
  }
  const normalized = value.toUpperCase();
  if (normalized === "PAGADA") {
    return "PAGADO";
  }
  const match = ORDER_STATUS_ALLOWED.find((status) => status === normalized);
  return match ?? DEFAULT_ORDER_STATUS;
};

type OrderFormDetailRow = {
  rowId: string;
  productId: string;
  quantity: number;
};

type OrderFormState = {
  clientId: string;
  details: OrderFormDetailRow[];
};

const createDetailRow = (): OrderFormDetailRow => ({
  rowId: typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`,
  productId: "",
  quantity: 1,
});

const buildInitialOrderFormState = (): OrderFormState => ({
  clientId: "",
  details: [createDetailRow()],
});

const issuedAtValue = (order: Order): number => {
  if (!order.issuedAt) {
    return 0;
  }
  const timestamp = Date.parse(order.issuedAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const sortOrdersByIssuedDate = (list: Order[]): Order[] =>
  [...list].sort((a, b) => {
    const diff = issuedAtValue(b) - issuedAtValue(a);
    if (diff !== 0) {
      return diff;
    }
    return b.id - a.id;
  });

const formatOrderDate = (value?: string): string => {
  if (!value) {
    return "Sin fecha";
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return value;
  }
  return new Date(timestamp).toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatStatusLabel = (status?: string): string => {
  if (!status) {
    return "Sin estado";
  }
  return status
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getStatusBadgeClass = (status?: string): string => {
  if (!status) {
    return dashboardStyles.badgeNeutral;
  }
  const normalized = status.toUpperCase();
  if (normalized.includes("CANCEL")) {
    return dashboardStyles.badgeLowStock;
  }
  if (normalized.includes("ENTREG") || normalized.includes("DESP") || normalized.includes("PAGA")) {
    return dashboardStyles.badgeHealthy;
  }
  return dashboardStyles.badgeNeutral;
};

export const AdminOrdersPage = () => {
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(true);

  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [orderFormState, setOrderFormState] = useState<OrderFormState>(buildInitialOrderFormState);
  const [orderFormSubmitting, setOrderFormSubmitting] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Order | null>(null);
  const [statusValue, setStatusValue] = useState<AllowedOrderStatus>(
    DEFAULT_ORDER_STATUS
  );
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const data = await getAllOrders();
      setOrders(sortOrdersByIssuedDate(data));
    } catch (error) {
      console.error("Error loading orders:", error);
      showNotification("No se pudieron cargar las boletas.", "error");
    } finally {
      setLoadingOrders(false);
    }
  }, [showNotification]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    let isMounted = true;
    const loadReferenceData = async () => {
      setReferenceLoading(true);
      try {
        const [userList, productList] = await Promise.all([getUsers(), getProducts()]);
        if (isMounted) {
          setUsers(sortUsersByName(userList));
          setProducts(productList);
        }
      } catch (error) {
        console.error("Error loading reference data:", error);
        showNotification("No se pudieron cargar usuarios o productos.", "error");
      } finally {
        if (isMounted) {
          setReferenceLoading(false);
        }
      }
    };

    void loadReferenceData();

    return () => {
      isMounted = false;
    };
  }, [showNotification]);

  const clientOptions = useMemo(() => {
    const clients = users.filter((user) => user.role === "CLIENTE");
    return clients.length ? clients : users;
  }, [users]);

  const statusOptions = useMemo<AllowedOrderStatus[]>(
    () => [...ORDER_STATUS_ALLOWED],
    []
  );

  const productDictionary = useMemo(() => {
    const map = new Map<number, Product>();
    products.forEach((product) => {
      map.set(product.id, product);
    });
    return map;
  }, [products]);

  const computedTotal = useMemo(() => {
    return orderFormState.details.reduce((sum, detail) => {
      if (!detail.productId || detail.quantity <= 0) {
        return sum;
      }
      const product = productDictionary.get(Number(detail.productId));
      if (!product) {
        return sum;
      }
      return sum + product.price * detail.quantity;
    }, 0);
  }, [orderFormState.details, productDictionary]);

  const totalOrders = orders.length;
  const totalAmount = useMemo(
    () => orders.reduce((sum, order) => sum + (order.total ?? 0), 0),
    [orders]
  );
  const cancelledOrders = useMemo(
    () => orders.filter((order) => order.status?.toUpperCase().includes("CANCEL")).length,
    [orders]
  );
  const activeOrders = totalOrders - cancelledOrders;

  const resetOrderForm = () => {
    setOrderFormState(buildInitialOrderFormState());
  };

  const openCreateOrderModal = () => {
    resetOrderForm();
    setOrderFormOpen(true);
  };

  const closeCreateOrderModal = () => {
    setOrderFormOpen(false);
    resetOrderForm();
  };

  const handleClientChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setOrderFormState((current) => ({
      ...current,
      clientId: value,
    }));
  };

  const handleDetailChange = (
    rowId: string,
    field: "productId" | "quantity",
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { value } = event.target;
    setOrderFormState((current) => ({
      ...current,
      details: current.details.map((detail) => {
        if (detail.rowId !== rowId) {
          return detail;
        }
        if (field === "productId") {
          return { ...detail, productId: value };
        }
        const quantity = Math.max(1, Number(value) || 1);
        return { ...detail, quantity };
      }),
    }));
  };

  const handleAddDetailRow = () => {
    setOrderFormState((current) => ({
      ...current,
      details: [...current.details, createDetailRow()],
    }));
  };

  const handleRemoveDetailRow = (rowId: string) => {
    setOrderFormState((current) => {
      if (current.details.length === 1) {
        return {
          ...current,
          details: [createDetailRow()],
        };
      }
      return {
        ...current,
        details: current.details.filter((detail) => detail.rowId !== rowId),
      };
    });
  };

  const canSubmitOrder = Boolean(
    orderFormState.clientId && computedTotal > 0 &&
      orderFormState.details.some((detail) => detail.productId && detail.quantity > 0)
  );

  const handleOrderFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validDetails = orderFormState.details.filter(
      (detail) => detail.productId && detail.quantity > 0
    );

    if (!orderFormState.clientId) {
      showNotification("Debes seleccionar un cliente.", "error");
      return;
    }

    if (!validDetails.length) {
      showNotification("Agrega al menos un producto a la boleta.", "error");
      return;
    }

    if (computedTotal <= 0) {
      showNotification("No es posible crear una boleta sin total.", "error");
      return;
    }

    const payload: CreateOrderPayload = {
      clientId: Number(orderFormState.clientId),
      total: computedTotal,
      details: validDetails.map((detail) => ({
        productId: Number(detail.productId),
        quantity: detail.quantity,
      })),
    };

    setOrderFormSubmitting(true);
    try {
      const newOrder = await createOrder(payload);
      setOrders((current) => sortOrdersByIssuedDate([newOrder, ...current.filter((order) => order.id !== newOrder.id)]));
      showNotification("Boleta creada correctamente.", "success");
      closeCreateOrderModal();
    } catch (error) {
      console.error("Error creating order:", error);
      showNotification("No se pudo crear la boleta.", "error");
    } finally {
      setOrderFormSubmitting(false);
    }
  };

  const openDetailModal = async (order: Order) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const detail = await getOrderById(order.id);
      setDetailOrder(detail ?? order);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      showNotification("No se pudo cargar el detalle de la boleta.", "error");
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailOrder(null);
  };

  const openStatusModal = (order: Order) => {
    setStatusTarget(order);
    setStatusValue(normalizeAllowedStatus(order.status));
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setStatusTarget(null);
    setStatusValue(DEFAULT_ORDER_STATUS);
  };

  const handleStatusSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!statusTarget?.id || !statusValue) {
      return;
    }

    setStatusSubmitting(true);
    try {
      const updated = await updateOrderStatus(statusTarget.id, statusValue);
      if (updated) {
        setOrders((current) =>
          sortOrdersByIssuedDate(
            current.map((order) => (order.id === updated.id ? updated : order))
          )
        );
        showNotification("Estado actualizado correctamente.", "success");
      }
      closeStatusModal();
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification("No se pudo actualizar el estado de la boleta.", "error");
    } finally {
      setStatusSubmitting(false);
    }
  };

  const openDeleteModal = (order: Order) => {
    setDeleteTarget(order);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleDeleteOrder = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeletingOrder(true);
    try {
      await deleteOrder(deleteTarget.id);
      setOrders((current) => current.filter((order) => order.id !== deleteTarget.id));
      showNotification("Boleta eliminada correctamente.", "success");
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting order:", error);
      showNotification("No se pudo eliminar la boleta.", "error");
    } finally {
      setDeletingOrder(false);
    }
  };

  const renderTableBody = () => {
    if (loadingOrders) {
      return (
        <tr>
          <td colSpan={6} className="py-5 text-center text-muted">
            Cargando boletas...
          </td>
        </tr>
      );
    }

    if (!orders.length) {
      return (
        <tr>
          <td colSpan={6} className="py-5 text-center text-muted">
            Aún no existen boletas registradas.
          </td>
        </tr>
      );
    }

    return orders.map((order) => (
      <tr key={order.id}>
        <td>
          <span
            className={`${dashboardStyles.tableValue} ${dashboardStyles.tableValueLight}`}
          >
            {order.number ?? `#${order.id}`}
          </span>
        </td>
        <td>
          <span
            className={`${dashboardStyles.tableValue} ${dashboardStyles.tableValueLight}`}
          >
            {order.clientName ?? "Sin cliente"}
          </span>
        </td>
        <td>
          <span className={`${dashboardStyles.tableBadge} ${getStatusBadgeClass(order.status)}`}>
            {formatStatusLabel(order.status)}
          </span>
        </td>
        <td>
          <span
            className={`${dashboardStyles.tableValue} ${dashboardStyles.tableValueLight}`}
          >
            {formatOrderDate(order.issuedAt)}
          </span>
        </td>
        <td className="text-end">
          <span
            className={`${dashboardStyles.tableValue} ${dashboardStyles.tableValueLight} ${dashboardStyles.tablePrice}`}
          >
            {formatCurrency(order.total ?? 0)}
          </span>
        </td>
        <td>
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className={dashboardStyles.tableAction}
              onClick={() => {
                void openDetailModal(order);
              }}
            >
              Ver detalle
            </button>
            <button
              type="button"
              className={dashboardStyles.tableAction}
              onClick={() => openStatusModal(order)}
            >
              Actualizar estado
            </button>
            <button
              type="button"
              className={dashboardStyles.tableAction}
              onClick={() => openDeleteModal(order)}
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  const renderDetailModal = () => {
    if (!detailModalOpen) {
      return null;
    }

    return (
      <>
        <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
              <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                <h5 className={dashboardStyles.modalTitle}>Detalle de boleta</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={closeDetailModal} />
              </div>
              <div className="modal-body">
                {detailLoading ? (
                  <p className="text-center text-muted my-4">Cargando detalle...</p>
                ) : detailOrder ? (
                  <>
                    <div className="row g-3 mb-4">
                      <div className="col-sm-6">
                        <p className="mb-1 text-muted">Cliente</p>
                        <p className="mb-0 fw-semibold">{detailOrder.clientName ?? "Sin cliente"}</p>
                        {detailOrder.clientEmail && (
                          <small className="text-muted">{detailOrder.clientEmail}</small>
                        )}
                      </div>
                      <div className="col-sm-3">
                        <p className="mb-1 text-muted">Boleta</p>
                        <p className="mb-0 fw-semibold">{detailOrder.number ?? `#${detailOrder.id}`}</p>
                      </div>
                      <div className="col-sm-3">
                        <p className="mb-1 text-muted">Estado</p>
                        <p className="mb-0 fw-semibold">{formatStatusLabel(detailOrder.status)}</p>
                      </div>
                      <div className="col-sm-6">
                        <p className="mb-1 text-muted">Fecha de emisión</p>
                        <p className="mb-0 fw-semibold">{formatOrderDate(detailOrder.issuedAt)}</p>
                      </div>
                      <div className="col-sm-3">
                        <p className="mb-1 text-muted">Total</p>
                        <p className="mb-0 fw-semibold">{formatCurrency(detailOrder.total ?? 0)}</p>
                      </div>
                      {detailOrder.pointsAwarded !== undefined && (
                        <div className="col-sm-3">
                          <p className="mb-1 text-muted">Puntos otorgados</p>
                          <p className="mb-0 fw-semibold">{detailOrder.pointsAwarded}</p>
                        </div>
                      )}
                      {detailOrder.couponCode && (
                        <div className="col-sm-6">
                          <p className="mb-1 text-muted">Cupón aplicado</p>
                          <p className="mb-0 fw-semibold">{detailOrder.couponCode}</p>
                        </div>
                      )}
                    </div>

                    <div className={dashboardStyles.tableResponsive}>
                      <table className={`table ${dashboardStyles.table}`}>
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-end">Precio unitario</th>
                            <th className="text-end">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailOrder.details.length ? (
                            detailOrder.details.map((detail) => (
                              <tr key={`${detail.productId}-${detail.productName}`}>
                                <td>{detail.productName}</td>
                                <td className="text-center">{detail.quantity}</td>
                                <td className="text-end">{formatCurrency(detail.unitPrice)}</td>
                                <td className="text-end">{formatCurrency(detail.unitPrice * detail.quantity)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-muted">
                                Esta boleta no tiene productos asociados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted my-4">
                    No se encontró información de la boleta seleccionada.
                  </p>
                )}
              </div>
              <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                <button type="button" className="btn btn-outline-light" onClick={closeDetailModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" />
      </>
    );
  };

  const renderStatusModal = () => {
    if (!statusModalOpen || !statusTarget) {
      return null;
    }

    return (
      <>
        <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
          <div className="modal-dialog">
            <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
              <form onSubmit={handleStatusSubmit}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={dashboardStyles.modalTitle}>Actualizar estado</h5>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={closeStatusModal} />
                </div>
                <div className="modal-body">
                  <p className="text-muted small mb-2">
                    Boleta {statusTarget.number ?? `#${statusTarget.id}`}
                  </p>
                  <label htmlFor="orderStatus" className="form-label">
                    Nuevo estado
                  </label>
                  <select
                    id="orderStatus"
                    className={`${dashboardStyles.darkField} ${dashboardStyles.darkSelect}`}
                    value={statusValue}
                    onChange={(event) =>
                      setStatusValue(normalizeAllowedStatus(event.target.value))
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {formatStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <p className={`${dashboardStyles.helperText} mt-2`}>
                    Usa un estado consistente para que los clientes puedan seguir sus compras.
                  </p>
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <button type="button" className="btn btn-outline-light" onClick={closeStatusModal} disabled={statusSubmitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success" disabled={statusSubmitting}>
                    {statusSubmitting ? "Actualizando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" />
      </>
    );
  };

  const renderDeleteModal = () => {
    if (!deleteTarget) {
      return null;
    }

    return (
      <>
        <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
          <div className="modal-dialog">
            <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
              <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                <h5 className={dashboardStyles.modalTitle}>Eliminar boleta</h5>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={closeDeleteModal} disabled={deletingOrder} />
              </div>
              <div className="modal-body">
                <p>
                  ¿Confirmas que deseas eliminar la boleta {deleteTarget.number ?? `#${deleteTarget.id}`}? Esta acción no se puede deshacer.
                </p>
              </div>
              <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                <button type="button" className="btn btn-outline-light" onClick={closeDeleteModal} disabled={deletingOrder}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={() => {
                  void handleDeleteOrder();
                }} disabled={deletingOrder}>
                  {deletingOrder ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" />
      </>
    );
  };

  const renderOrderFormModal = () => {
    if (!orderFormOpen) {
      return null;
    }

    return (
      <>
        <div className="modal fade show d-block" role="dialog" aria-modal="true" tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className={`modal-content ${dashboardStyles.modalContentDark}`}>
              <form onSubmit={handleOrderFormSubmit}>
                <div className={`modal-header ${dashboardStyles.modalHeaderDark}`}>
                  <h5 className={dashboardStyles.modalTitle}>Nueva boleta</h5>
                  <button type="button" className="btn-close" aria-label="Cerrar" onClick={closeCreateOrderModal} disabled={orderFormSubmitting} />
                </div>
                <div className="modal-body">
                  {referenceLoading && (
                    <p className="text-muted">Cargando clientes y productos...</p>
                  )}

                  <div className="mb-3">
                    <label htmlFor="orderClient" className="form-label">
                      Cliente
                    </label>
                    <select
                      id="orderClient"
                      className={`${dashboardStyles.darkField} ${dashboardStyles.darkSelect}`}
                      value={orderFormState.clientId}
                      onChange={handleClientChange}
                      disabled={referenceLoading || !clientOptions.length}
                    >
                      <option value="">Selecciona un cliente</option>
                      {clientOptions.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.fullName} ({client.email})
                        </option>
                      ))}
                    </select>
                    {!clientOptions.length && !referenceLoading && (
                      <p className={`${dashboardStyles.helperText} mt-2`}>
                        No hay usuarios disponibles para crear boletas.
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label mb-0">Productos</label>
                      <button type="button" className="btn btn-sm btn-outline-light" onClick={handleAddDetailRow}>
                        Agregar línea
                      </button>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {orderFormState.details.map((detail) => {
                        const product = detail.productId ? productDictionary.get(Number(detail.productId)) : undefined;
                        const lineTotal = product ? product.price * detail.quantity : 0;
                        return (
                          <div key={detail.rowId} className="row g-3 align-items-end">
                            <div className="col-md-6">
                              <label className="form-label">Producto</label>
                              <select
                                className={`${dashboardStyles.darkField} ${dashboardStyles.darkSelect}`}
                                value={detail.productId}
                                onChange={(event) => handleDetailChange(detail.rowId, "productId", event)}
                                disabled={referenceLoading || !products.length}
                              >
                                <option value="">Selecciona un producto</option>
                                {products.map((productOption) => (
                                  <option key={productOption.id} value={productOption.id}>
                                    {productOption.name}
                                  </option>
                                ))}
                              </select>
                              {product && (
                                <small className="text-muted">
                                  Precio unitario: {formatCurrency(product.price)}
                                </small>
                              )}
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Cantidad</label>
                              <input
                                type="number"
                                min={1}
                                className={dashboardStyles.darkField}
                                value={detail.quantity}
                                onChange={(event) => handleDetailChange(detail.rowId, "quantity", event)}
                              />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Subtotal</label>
                              <div className="fw-semibold">{formatCurrency(lineTotal)}</div>
                              <button type="button" className="btn btn-link text-danger p-0 mt-1" onClick={() => handleRemoveDetailRow(detail.rowId)}>
                                Quitar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top pt-3">
                    <span className="text-muted">Total estimado</span>
                    <strong className="fs-5">{formatCurrency(computedTotal)}</strong>
                  </div>
                </div>
                <div className={`modal-footer ${dashboardStyles.modalFooterDark}`}>
                  <button type="button" className="btn btn-outline-light" onClick={closeCreateOrderModal} disabled={orderFormSubmitting}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success" disabled={!canSubmitOrder || orderFormSubmitting}>
                    {orderFormSubmitting ? "Creando..." : "Crear boleta"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="modal-backdrop fade show" />
      </>
    );
  };

  return (
    <div className={dashboardStyles.dashboardWrapper}>
      <div className="container">
        <header className={`${dashboardStyles.dashboardHeader} mb-4`}>
          <div className={dashboardStyles.headerContent}>
            <p className={dashboardStyles.dashboardEyebrow}>Administrador · Boletas</p>
            <h1 className={dashboardStyles.dashboardHeadline}>Gestión de boletas</h1>
            <p className={dashboardStyles.dashboardDescription}>
              Controla cada boleta emitida, crea notas manuales cuando lo necesites y mantén actualizado el estado de los pedidos.
            </p>
          </div>
          <span className={`${dashboardStyles.roleBadge} ${dashboardStyles.roleAdmin}`}>
            Administrador
          </span>
        </header>

        <div className="d-flex flex-wrap gap-3 mb-4">
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeNeutral}`}>
            Total: {totalOrders}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeHealthy}`}>
            Activas: {activeOrders}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeLowStock}`}>
            Canceladas: {cancelledOrders}
          </span>
          <span className={`${dashboardStyles.metricsPill} ${dashboardStyles.badgeHealthy}`}>
            Recaudado: {formatCurrency(totalAmount)}
          </span>
        </div>

        <div className={dashboardStyles.tableCard}>
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
            <div>
              <h2 className="h5 mb-1">Boletas registradas</h2>
              <p className={dashboardStyles.helperText}>Actualiza el estado o revisa los detalles de cada pedido.</p>
            </div>
            <button
              type="button"
              className={dashboardStyles.primaryButton}
              onClick={openCreateOrderModal}
            >
              Crear boleta
            </button>
          </div>

          <div className={dashboardStyles.tableResponsive}>
            <table className={`table ${dashboardStyles.table}`}>
              <thead>
                <tr>
                  <th>Boleta</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Emisión</th>
                  <th className="text-end">Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>
        </div>
      </div>

      {renderOrderFormModal()}
      {renderDetailModal()}
      {renderStatusModal()}
      {renderDeleteModal()}
    </div>
  );
};
