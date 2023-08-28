import React, { createContext, useContext, useState, useEffect } from 'react';

const DownloadContext = createContext();

export function useDownloadContext() {
  return useContext(DownloadContext);
}

export function DownloadProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = (item) => {
    items.filter((i) => i.label === item.label).length === 0 && setItems([...items, item]);
  };

  const removeItem = (item) => {
    setItems(items.filter((i) => i.label !== item.label));
  };

  return (
    <DownloadContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </DownloadContext.Provider>
  );
}
