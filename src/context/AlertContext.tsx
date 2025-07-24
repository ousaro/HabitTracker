// context/AlertContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { GlobalAlert } from '../components/GlobalAlert'; 

type AlertOptions = {
  type?: 'success' | 'error' | 'confirm' | 'info';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const AlertContext = createContext<(options: AlertOptions) => void>(() => {});

export const useAlert = () => useContext(AlertContext);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const showAlert = (opts: AlertOptions) => {
   setOptions({
    ...opts,
    onConfirm: () => {
      opts.onConfirm?.();
      setVisible(false);
    },
    onCancel: () => {
      opts.onCancel?.();
      setVisible(false);
    },
  });
  setVisible(true);
  };

  const handleConfirm = () => {
    options?.onConfirm?.();
    setVisible(false);
  };

  const handleCancel = () => {
    options?.onCancel?.();
    setVisible(false);
  };


  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      {visible && options && (
        <GlobalAlert
          visible={visible}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          {...options}
        />
      )}
    </AlertContext.Provider>
  );
};
