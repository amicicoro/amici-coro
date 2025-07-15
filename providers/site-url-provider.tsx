'use client';

import React, { createContext, PropsWithChildren, useContext } from 'react';

type SiteDetailsProviderProps = PropsWithChildren & {
  value: string;
};

export const SiteUrlProvider = ({
  value,
  children,
}: SiteDetailsProviderProps) => (
  <SiteUrlContext.Provider value={value}>{children}</SiteUrlContext.Provider>
);

export const SiteUrlContext = createContext<string>('');

export const useSiteUrl = () => useContext(SiteUrlContext);
