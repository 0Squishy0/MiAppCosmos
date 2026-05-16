import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';

// Previene que el Splash Screen se oculte automáticamente antes de que las rutas y fuentes estén listas
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Inicializa el hook de fuentes por defecto de Expo
  const [loaded, error] = useFonts({});

  useEffect(() => {
    // Si las fuentes cargaron correctamente (o si tiró error pero terminó el proceso), desmontamos el Splash
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Si todavía no terminó de verificar el entorno, mantenemos la pantalla de carga nativa en blanco/splash
  if (!loaded && !error) {
    return null;
  }

  // Retorna el contenedor de pantallas (Stack) limpio
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}