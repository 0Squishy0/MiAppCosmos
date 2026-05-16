import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function MenuPrincipal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>KIOSCO OASIS</Text>
      
      <View style={styles.grid}>
        <Link href="/venta" asChild>
          <Pressable style={styles.btnVenta}><Text style={styles.btnText}>🛒 NUEVA VENTA 🛒</Text></Pressable>
        </Link>

        <Link href="/stock" asChild>
          <Pressable style={styles.btnStock}><Text style={styles.btnText}>📦 STOCK / INVENTARIO 📦</Text></Pressable>
        </Link>

        <Link href="/caja" asChild>
          <Pressable style={styles.btnCaja}><Text style={styles.btnText}>💰 CAJA DIARIA 💰</Text></Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '300', letterSpacing: 6, marginBottom: 50, color: '#2D3436' },
  grid: { width: '90%', maxWidth: 400 },
  btnText: { fontWeight: 'bold', letterSpacing: 1, color: '#2D3436' },
  btnVenta: { backgroundColor: '#A8E6CF', padding: 55, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  btnStock: { backgroundColor: '#FFD3B6', padding: 55, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
  btnCaja: { backgroundColor: '#DCEDC1', padding: 55, borderRadius: 20, alignItems: 'center', marginBottom: 15 },
});