import { Stack } from 'expo-router';
import { KioscoProvider } from './contexto';

export default function RootLayout() {
  return (
    <KioscoProvider>
      <Stack screenOptions={{ 
        headerShown: false, 
        animation: 'fade',
        contentStyle: { backgroundColor: '#FFF' } 
      }} />
    </KioscoProvider>
  );
}