import { useRef } from 'react';
import Sheet from './Sheet.jsx';
import ConfirmBody from './ConfirmBody.jsx';

/**
 * For destructive actions. Focus starts on Cancel, the safe choice.
 * `session` remounts the body, so an old error never reappears.
 */
export default function ConfirmSheet({ open, session, title, onClose, children, ...bodyProps }) {
  const cancelRef = useRef(null);
  return (
    <Sheet open={open} onClose={onClose} title={title} initialFocusRef={cancelRef}>
      <ConfirmBody key={session} cancelRef={cancelRef} onCancel={onClose} {...bodyProps}>
        {children}
      </ConfirmBody>
    </Sheet>
  );
}
