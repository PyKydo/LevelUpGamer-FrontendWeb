interface ProductCardProps {
    id: string;
    name: string;
    category: string;
    image: string;
    description: string;
    price: number;
    originalPrice?: number;
}
export declare const ProductCard: ({ id, name, category, image, description, price, originalPrice }: ProductCardProps) => import("react/jsx-runtime").JSX.Element;
export {};
