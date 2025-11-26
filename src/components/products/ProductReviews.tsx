import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import {
  createProductReview,
  getProductReviews,
  getUserOrders,
  type CreateReviewPayload,
  type ProductReview,
} from "../../helpers/api.helper";
import { reportError } from "../../helpers/logging.helper";

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

type EligibilityState =
  | "guest"
  | "not-client"
  | "checking"
  | "ineligible"
  | "eligible";

const RATING_OPTIONS = [5, 4, 3, 2, 1];

export const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const { user, isClient } = useAuth();
  const { showNotification } = useNotification();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [eligibility, setEligibility] = useState<EligibilityState>("guest");

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      if (!productId) {
        setReviews([]);
        setLoadingReviews(false);
        return;
      }

      setLoadingReviews(true);
      try {
        const data = await getProductReviews(productId);
        if (isMounted) {
          setReviews(data);
        }
      } catch (error) {
        reportError("ProductReviews:loadReviews", error);
      } finally {
        if (isMounted) {
          setLoadingReviews(false);
        }
      }
    };

    void loadReviews();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    let isMounted = true;
    const userId = user?.id;

    if (!productId) {
      setEligibility("ineligible");
      return () => {
        isMounted = false;
      };
    }

    if (!userId) {
      setEligibility("guest");
      return () => {
        isMounted = false;
      };
    }

    if (!isClient) {
      setEligibility("not-client");
      return () => {
        isMounted = false;
      };
    }

    setEligibility("checking");

    const verifyPurchase = async () => {
      try {
        const orders = await getUserOrders(userId);
        if (!isMounted) {
          return;
        }
        const purchased = orders.some((order) =>
          order.details.some((detail) => detail.productId === productId)
        );
        setEligibility(purchased ? "eligible" : "ineligible");
      } catch (error) {
        reportError("ProductReviews:verifyPurchase", error);
        if (isMounted) {
          setEligibility("ineligible");
        }
      }
    };

    void verifyPurchase();

    return () => {
      isMounted = false;
    };
  }, [productId, user?.id, isClient]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productId || !user) {
      showNotification("Debes iniciar sesión para enviar una reseña.", "error");
      return;
    }

    if (!comment.trim()) {
      showNotification("Escribe un comentario para tu reseña.", "error");
      return;
    }

    const payload: CreateReviewPayload = {
      productId,
      text: comment,
      rating,
    };

    setSubmitting(true);
    try {
      const newReview = await createProductReview(payload);
      setReviews((current) => [newReview, ...current]);
      setComment("");
      setRating(5);
      showNotification("Gracias por compartir tu experiencia.", "success");
    } catch (error) {
      const isForbidden =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 403;
      if (isForbidden) {
        showNotification(
          "Solo puedes reseñar productos que hayas comprado.",
          "error"
        );
      } else {
        showNotification("No se pudo enviar tu reseña.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reviewCountLabel = useMemo(() => {
    const count = reviews.length;
    if (count === 0) {
      return "Aún no hay reseñas";
    }
    if (count === 1) {
      return "1 reseña";
    }
    return `${count} reseñas`;
  }, [reviews.length]);

  const formatDate = (isoDate?: string) => {
    if (!isoDate) {
      return "";
    }
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return isoDate;
    }
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderRating = (value: number) => {
    return (
      <span className="text-warning" aria-label={`Calificación ${value} de 5`}>
        {"★".repeat(value)}
        {"☆".repeat(5 - value)}
      </span>
    );
  };

  const renderEligibilityMessage = () => {
    switch (eligibility) {
      case "guest":
        return (
          <p className="text-muted">
            Inicia sesión como cliente para compartir tu experiencia.
          </p>
        );
      case "not-client":
        return (
          <p className="text-muted">
            Solo los clientes pueden publicar reseñas en esta sección.
          </p>
        );
      case "checking":
        return (
          <p className="text-muted">
            Verificando tus compras para habilitar la reseña…
          </p>
        );
      case "ineligible":
        return (
          <p className="text-muted">
            Solo los clientes que compraron este producto pueden reseñarlo.
          </p>
        );
      case "eligible":
        return (
          <p className="text-muted">
            Tu reseña aparecerá públicamente luego de enviarla.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <section className="mt-5" aria-labelledby="product-reviews-title">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 id="product-reviews-title" className="mb-1">
            Reseñas de clientes
          </h3>
          <p className="text-muted mb-0">{reviewCountLabel}</p>
        </div>
        <span className="badge bg-secondary">{productName}</span>
      </div>

      {loadingReviews ? (
        <div className="text-center py-4">
          <div
            className="spinner-border"
            role="status"
            aria-label="Cargando reseñas"
          />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted">Sé la primera persona en reseñar este producto.</p>
      ) : (
        <ul className="list-group mb-4">
          {reviews.map((review) => (
            <li key={review.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{review.userName}</strong>
                  <div>{renderRating(review.rating)}</div>
                </div>
                <small className="text-muted">{formatDate(review.createdAt)}</small>
              </div>
              <p className="mb-0 mt-2">{review.text}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="h5 mb-3">Comparte tu experiencia</h4>
          {renderEligibilityMessage()}

          {eligibility === "eligible" && (
            <form onSubmit={handleSubmit} className="mt-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="review-rating" className="form-label">
                    Calificación
                  </label>
                  <select
                    id="review-rating"
                    className="form-select"
                    value={rating}
                    onChange={(event) => setRating(Number(event.target.value))}
                    disabled={submitting}
                  >
                    {RATING_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value} estrellas
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <label htmlFor="review-comment" className="form-label">
                    Comentario
                  </label>
                  <textarea
                    id="review-comment"
                    className="form-control"
                    rows={4}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    maxLength={1000}
                    placeholder="Cuenta qué te pareció este producto"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-3"
                disabled={submitting}
              >
                {submitting ? "Enviando reseña..." : "Enviar reseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
