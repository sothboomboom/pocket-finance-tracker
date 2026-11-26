import { forwardRef, useId } from 'react';
import CategoryIcon from '../../components/CategoryIcon.jsx';
import { Skeleton, FieldError } from '../../components/Feedback.jsx';
import { Button } from '../../components/Button.jsx';
import styles from './CategoryPicker.module.css';

// Native radio inputs, so arrow keys work.
const CategoryPicker = forwardRef(function CategoryPicker(
  { categories, status, onRetry, value, onChange, error },
  firstInputRef,
) {
  const name = useId();
  const errorId = `${name}-error`;

  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? errorId : undefined}>
      <legend className={styles.legend}>Category</legend>

      {status === 'loading' && (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className={styles.chipSkeleton} />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className={styles.loadError}>
          <FieldError id={errorId}>Couldn't load categories.</FieldError>
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}

      {status === 'success' && (
        <div className={styles.grid}>
          {categories.map((category, index) => {
            const id = `${name}-${category.id}`;
            return (
              <span key={category.id} className={styles.option}>
                <input
                  ref={index === 0 ? firstInputRef : undefined}
                  type="radio"
                  id={id}
                  name={name}
                  value={category.id}
                  checked={value === category.id}
                  onChange={() => onChange(category.id)}
                  className={styles.input}
                  aria-invalid={error ? 'true' : undefined}
                />
                <label htmlFor={id} className={styles.chip}>
                  <CategoryIcon icon={category.icon} color={category.color} />
                  <span className={styles.name}>{category.name}</span>
                </label>
              </span>
            );
          })}
        </div>
      )}

      {status !== 'error' && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
});

export default CategoryPicker;
