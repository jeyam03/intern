import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {

  const colorScheme = useColorScheme();
  const [paperTheme, setPaperTheme] = useState(colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme);

  useEffect(() => {
    setPaperTheme(colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme);
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ paperTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};