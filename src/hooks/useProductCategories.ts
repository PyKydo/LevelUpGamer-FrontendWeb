import { useCallback, useEffect, useState } from "react";
import {
  getProductCategories,
  type ProductCategory,
} from "../helpers/api.helper";

interface UseProductCategoriesOptions {
  onlyActive?: boolean;
}

const categoryNameCollator = new Intl.Collator("es", { sensitivity: "base" });

const sortCategoriesByName = (list: ProductCategory[]): ProductCategory[] =>
  [...list].sort((a, b) =>
    categoryNameCollator.compare(a.name ?? "", b.name ?? "")
  );

export const useProductCategories = (
  options: UseProductCategoriesOptions = {}
): {
  categories: ProductCategory[];
  loading: boolean;
  error: unknown;
  refresh: () => Promise<void>;
} => {
  const { onlyActive = true } = options;
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductCategories();
      const filtered = onlyActive
        ? data.filter((category) => category.active !== false)
        : data;
      setCategories(sortCategoriesByName(filtered));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [onlyActive]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    refresh: loadCategories,
  };
};
