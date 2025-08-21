import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { MdClose } from 'react-icons/md';
import './styles/dialog.css';

type DialogType = 'alert' | 'confirm';

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  resolve: (value: boolean) => void;
}

interface DialogContextType {
  openDialog: (type: DialogType, title: string, message: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}

interface DialogProviderProps {
  children: ReactNode;
}

export function DialogProvider({ children }: DialogProviderProps) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const openDialog = useCallback((type: DialogType, title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type,
        title,
        message,
        resolve,
      });
    });
  }, []);

  const closeDialog = useCallback((result: boolean) => {
    if (dialog) {
      dialog.resolve(result);
      setDialog(null);
    }
  }, [dialog]);

  const handleConfirm = useCallback(() => closeDialog(true), [closeDialog]);
  const handleCancel = useCallback(() => closeDialog(false), [closeDialog]);

  return (
    <DialogContext.Provider value={{ openDialog }}>
      {children}
      {dialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>{dialog.title}</h3>
              <button
                className="dialog-close"
                onClick={() => closeDialog(false)}
                aria-label="Close dialog"
              >
                <MdClose size={20} />
              </button>
            </div>
            <div className="dialog-content">
              <p>{dialog.message}</p>
            </div>
            <div className="dialog-actions">
              {dialog.type === 'confirm' ? (
                <>
                  <button
                    className="dialog-button dialog-button-cancel"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="dialog-button dialog-button-confirm"
                    onClick={handleConfirm}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  className="dialog-button dialog-button-ok"
                  onClick={handleConfirm}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
