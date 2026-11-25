import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import IconButton from './IconButton.jsx';

/** Like the browser's Back button, but goes to `fallback` when the page was opened directly. */
export default function BackButton({ fallback = '/', label = 'Back' }) {
  const navigate = useNavigate();
  const location = useLocation();
  // React Router gives the first page of a visit the key 'default'.
  const hasAppHistory = location.key !== 'default';

  return <IconButton icon={ArrowLeft} label={label} onClick={() => (hasAppHistory ? navigate(-1) : navigate(fallback))} />;
}
