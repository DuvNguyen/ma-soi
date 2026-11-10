import React, { createContext, useContext, useState, useCallback } from 'react';
import GothicDialog from '../components/ui/GothicDialog';

const GothicDialogContext = createContext(null);

export function GothicDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'confirm',
    variant: 'blood',
    title: '',
    message: '',
    confirmText: 'Xác Nhận 🩸',
    cancelText: 'Hủy Bỏ',
    useWolfHeadIcon: true,
    onConfirm: null,
    onCancel: null
  });

  const showConfirm = useCallback(({
    title = 'XÁC NHẬN HÀNH ĐỘNG',
    message = '',
    variant = 'blood',
    confirmText = 'Xác Nhận 🩸',
    cancelText = 'Hủy Bỏ',
    useWolfHeadIcon = true,
    onConfirm,
    onCancel
  }) => {
    setDialogState({
      isOpen: true,
      type: 'confirm',
      variant,
      title,
      message,
      confirmText,
      cancelText,
      useWolfHeadIcon,
      onConfirm,
      onCancel
    });
  }, []);

  const showAlert = useCallback(({
    title = 'THÔNG BÁO QUẢN TRÒ',
    message = '',
    variant = 'blood',
    confirmText = 'Đã Hiểu ✓',
    useWolfHeadIcon = true,
    onConfirm
  }) => {
    setDialogState({
      isOpen: true,
      type: 'alert',
      variant,
      title,
      message,
      confirmText,
      cancelText: '',
      useWolfHeadIcon,
      onConfirm,
      onCancel: null
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <GothicDialogContext.Provider value={{ showConfirm, showAlert, closeDialog }}>
      {children}
      <GothicDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        type={dialogState.type}
        variant={dialogState.variant}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        useWolfHeadIcon={dialogState.useWolfHeadIcon}
        onConfirm={dialogState.onConfirm}
        onCancel={dialogState.onCancel}
      />
    </GothicDialogContext.Provider>
  );
}

export function useGothicDialog() {
  const context = useContext(GothicDialogContext);
  if (!context) {
    throw new Error('useGothicDialog must be used within a GothicDialogProvider');
  }
  return context;
}
