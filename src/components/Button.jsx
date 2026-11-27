import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './Button.module.css';

export function Button({ variant = 'primary', icon: Icon, className = '', children, type = 'button', ...rest }) {
  return (
    <button type={type} className={`${styles.button} ${styles[variant]} ${className}`} {...rest}>
      {Icon && <Icon className={styles.icon} strokeWidth={2} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({ icon: Icon, label, className = '', ...rest }) {
  return (
    <button type="button" className={`${styles.iconButton} ${className}`} aria-label={label} {...rest}>
      <Icon strokeWidth={2} aria-hidden="true" />
    </button>
  );
}

export function BackButton({ fallback = '/', label = 'Back' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasAppHistory = location.key !== 'default';

  return <IconButton icon={ArrowLeft} label={label} onClick={() => (hasAppHistory ? navigate(-1) : navigate(fallback))} />;
}
