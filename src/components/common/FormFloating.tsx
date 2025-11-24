import { InputHTMLAttributes } from 'react';
import styles from './FormFloating.module.css';

interface FormFloatingProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
    className?: string;
}

export const FormFloating = ({ label, id, className = '', ...props }: FormFloatingProps) => {
    return (
        <div className={`form-floating mb-3 ${styles.formFloating} ${className}`}>
            <input
                id={id}
                className={`form-control ${styles.formControl}`}
                placeholder={label}
                {...props}
            />
            <label htmlFor={id}>{label}</label>
        </div>
    );
};
