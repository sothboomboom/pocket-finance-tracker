import styles from './ChartEmpty.module.css';

export default function ChartEmpty({ children }) {
  return <p className={styles.empty}>{children}</p>;
}
