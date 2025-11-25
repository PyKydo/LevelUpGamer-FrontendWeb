import type { SelectHTMLAttributes } from 'react';
import styles from './FormSelect.module.css';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    id: string;
    options: { value: string; label: string }[];
    className?: string;
    floating?: boolean;
}

export const FormSelect = ({
    label,
    id,
    options,
    className = '',
    floating = false,
    ...props
}: FormSelectProps) => {
    const selectElement = (
        <select
            id={id}
            className={`form-select ${styles.formSelect} ${className}`}
            {...props}
        >
            {options.map((option, index) => (
                <option key={`${option.value}-${index}`} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );

    if (floating && label) {
        return (
            <div className={`form-floating mb-3 ${styles.formFloating}`}>
                {selectElement}
                <label htmlFor={id}>{label}</label>
            </div>
        );
    }

    return (
        <div className="mb-3">
            {label && <label htmlFor={id} className="form-label">{label}</label>}
            {selectElement}
        </div>
    );
};
