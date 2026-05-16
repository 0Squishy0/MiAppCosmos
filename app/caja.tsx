import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Cambiamos la importación apuntando al contexto fuera de la carpeta app/
import { useKiosco } from '../hooks/contexto';

function FilaVentaExpandible({ item }: { item: any }) {
  const { obtenerDetallesVenta } = useKiosco();
  const [expandido, setExpandido] = useState(false);
  const [detalles, setDetalles] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const manejarTouch = async () => {
    const nuevoEstado = !expandido;
    setExpandido(nuevoEstado);

    if (nuevoEstado && detalles.length === 0) {
      setCargando(true);
      const data = await obtenerDetallesVenta(item.id);
      setDetalles(data);
      setCargando(false);
    }
  };

  return (
    <View style={styles.contenedorFila}>
      <TouchableOpacity style={styles.filaVenta} onPress={manejarTouch} activeOpacity={0.7}>
        <View>
          <Text style={styles.tipoMovimiento}>Venta Registrada {expandido ? '▲' : '▼'}</Text>
          <Text style={styles.horaTexto}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
          </Text>
        </View>
        <Text style={styles.montoVenta}>+ $ {item.total}</Text>
      </TouchableOpacity>

      {expandido && (
        <View style={styles.desgloseContainer}>
          <Text style={styles.desgloseTitulo}>Productos vendidos:</Text>
          {cargando ? (
            <ActivityIndicator size="small" color="#000" style={{ marginVertical: 10 }} />
          ) : detalles.length > 0 ? (
            detalles.map((prod) => (
              <View key={prod.id} style={styles.itemDesglosado}>
                <Text style={styles.prodNombre}>• {prod.nombre_producto}</Text>
                <Text style={styles.prodDetalle}>{prod.cantidad} x ${prod.precio_unitario}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.sinDetalles}>Sin desglose disponible para transacciones previas.</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function CajaScreen() {
  const { ventasHoy, totalCaja, obtenerVentasDelDia } = useKiosco();

  useEffect(() => {
    obtenerVentasDelDia();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerCaja}>
        <Text style={styles.tituloHeader}>Balance de Hoy</Text>
        <Text style={styles.montoTotal}>$ {totalCaja}</Text>
        <Text style={styles.fechaTexto}>
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      <Text style={styles.seccionTitulo}>Historial de Movimientos</Text>

      <FlatList
        data={ventasHoy}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FilaVentaExpandible item={item} />}
        ListEmptyComponent={
          <View style={styles.vacioContainer}>
            <Text style={styles.vacioTexto}>Aún no se registraron ventas hoy.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  headerCaja: { backgroundColor: '#000', padding: 30, borderRadius: 24, alignItems: 'center', marginBottom: 25 , marginTop: 28},
  tituloHeader: { color: '#aaa', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  montoTotal: { color: '#fff', fontSize: 44, fontWeight: 'bold', marginVertical: 8 },
  fechaTexto: { color: '#BFFCC6', fontWeight: 'bold', fontSize: 13, textTransform: 'capitalize' },
  seccionTitulo: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  contenedorFila: { borderBottomWidth: 1, borderColor: '#f5f5f5', paddingVertical: 4 },
  filaVenta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  tipoMovimiento: { fontSize: 16, fontWeight: '500', color: '#222' },
  horaTexto: { color: '#aaa', fontSize: 12, marginTop: 2 },
  montoVenta: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32' },
  desgloseContainer: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#E0BBE4' },
  desgloseTitulo: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 6, textTransform: 'uppercase' },
  itemDesglosado: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  prodNombre: { fontSize: 14, color: '#333' },
  prodDetalle: { fontSize: 14, color: '#666', fontWeight: '500' },
  sinDetalles: { fontSize: 13, color: '#999', fontStyle: 'italic' },
  vacioContainer: { alignItems: 'center', marginTop: 40 },
  vacioTexto: { color: '#999', fontSize: 14, textAlign: 'center' }
});