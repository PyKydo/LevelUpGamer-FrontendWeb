interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}
interface CartItemCardProps {
    item: CartItem;
}
export declare const CartItemRow: ({ item }: CartItemCardProps) => import("react/jsx-runtime").JSX.Element;
export {};
