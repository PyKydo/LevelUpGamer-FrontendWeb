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
import styles from "./ProductReviews.module.css";

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
      <span className={styles.ratingStars} aria-label={`Calificación ${value} de 5`}>
        {"★".repeat(value)}
        {"☆".repeat(5 - value)}
      </span>
    );
  };

  const renderEligibilityMessage = () => {
    const messageClass = styles.eligibilityMessage;

    switch (eligibility) {
      case "guest":
        return (
          <p className={messageClass}>
            Inicia sesión como cliente para compartir tu experiencia.
          </p>
        );
      case "not-client":
        return (
          <p className={messageClass}>
            Solo los clientes pueden publicar reseñas en esta sección.
          </p>
        );
      case "checking":
        return (
          <p className={messageClass}>
            Verificando tus compras para habilitar la reseña…
          </p>
        );
      case "ineligible":
        return (
          <p className={messageClass}>
            Solo los clientes que compraron este producto pueden reseñarlo.
          </p>
        );
      case "eligible":
        return (
          <p className={messageClass}>
            Tu reseña aparecerá públicamente luego de enviarla.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <section
      className={`mt-5 ${styles.reviewsSection}`}
      aria-labelledby="product-reviews-title"
    >
      <div className={styles.sectionHeader}>
        <div>
          <h3 id="product-reviews-title" className={styles.sectionTitle}>
            Reseñas de clientes
          </h3>
          <p className={styles.reviewCount}>{reviewCountLabel}</p>
        </div>
        <span className={styles.productTag}>{productName}</span>
      </div>

      {loadingReviews ? (
        <div className={styles.loadingState}>
          <div
            className={`spinner-border ${styles.loadingSpinner}`}
            role="status"
            aria-label="Cargando reseñas"
          />
        </div>
      ) : reviews.length === 0 ? (
        <p className={styles.emptyState}>
          Sé la primera persona en reseñar este producto.
        </p>
      ) : (
        <ul className={styles.reviewsList}>
          {reviews.map((review) => (
            <li key={review.id} className={styles.reviewItem}>
              <div className={styles.reviewMeta}>
                <div>
                  <strong className={styles.reviewUser}>{review.userName}</strong>
                  <div>{renderRating(review.rating)}</div>
                </div>
                <small className={styles.reviewDate}>
                  {formatDate(review.createdAt)}
                </small>
              </div>
              <p className={styles.reviewText}>{review.text}</p>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.formCard}>
        <h4 className={styles.formTitle}>Comparte tu experiencia</h4>
        {renderEligibilityMessage()}

        {eligibility === "eligible" && (
          <form onSubmit={handleSubmit} className={styles.reviewForm}>
            <div className={styles.fieldGroup}>
              <label htmlFor="review-rating" className={styles.label}>
                Calificación
              </label>
              <select
                id="review-rating"
                className={styles.select}
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

            <div className={styles.fieldGroup}>
              <label htmlFor="review-comment" className={styles.label}>
                Comentario
              </label>
              <textarea
                id="review-comment"
                className={styles.textarea}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={1000}
                placeholder="Cuenta qué te pareció este producto"
                disabled={submitting}
                required
              />
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitting}
              >
                {submitting ? "Enviando reseña..." : "Enviar reseña"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
