import type { TextareaHTMLAttributes } from 'react';
import styles from './FormFloating.module.css';

interface FormFloatingTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    id: string;
    className?: string;
}

export const FormFloatingTextarea = ({ label, id, className = '', style, ...props }: FormFloatingTextareaProps) => {
    return (
        <div className={`form-floating mb-3 ${styles.formFloating} ${className}`}>
            <textarea
                id={id}
                className={`form-control ${styles.formControl}`}
                placeholder={label}
                style={{ resize: 'none', ...style }}
                {...props}
            />
            <label htmlFor={id}>{label}</label>
        </div>
    );
};
