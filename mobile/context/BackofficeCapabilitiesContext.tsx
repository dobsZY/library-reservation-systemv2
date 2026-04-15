import { createContext, useContext, type ReactNode } from 'react';

export type BackofficeVariant = 'admin' | 'staff';

export type BackofficeCapabilities = {
  variant: BackofficeVariant;
  /** Yönetici rezervasyon iptali */
  allowCancelReservation: boolean;
  /** Kroki / masa konum düzenleme */
  allowTableEdit: boolean;
};

const defaultCapabilities: BackofficeCapabilities = {
  variant: 'admin',
  allowCancelReservation: true,
  allowTableEdit: true,
};

const BackofficeCapabilitiesContext = createContext<BackofficeCapabilities>(defaultCapabilities);

export function BackofficeCapabilitiesProvider({
  value,
  children,
}: {
  value: BackofficeCapabilities;
  children: ReactNode;
}) {
  return (
    <BackofficeCapabilitiesContext.Provider value={value}>{children}</BackofficeCapabilitiesContext.Provider>
  );
}

export function useBackofficeCapabilities(): BackofficeCapabilities {
  return useContext(BackofficeCapabilitiesContext);
}
