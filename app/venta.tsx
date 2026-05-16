import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Producto, useKiosco } from './contexto'; // Importamos el tipo Producto

export default function VentasScreen() {
  const { productos, registrarVenta } = useKiosco();
  const [permission, requestPermission] = useCameraPermissions();
  
  const [carrito, setCarrito] = useState<any[]>([]);
  const [camaraVisible, setCamaraVisible] = useState(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  // --- CÁLCULO DEL TOTAL ---
  // Usamos precio_venta que es el nombre real en la base de datos
  const totalVenta = carrito.reduce((acc, item) => {
    const precio = Number(item.precio_venta) || 0;
    return acc + (precio * item.cantidad);
  }, 0);

  const manejarEscaneo = ({ data }: { data: string }) => {
    setCamaraVisible(false);
    
    // Buscamos el producto por su código de barras
    const encontrado = productos.find((p: Producto) => p.barcode === data);

    if (encontrado) {
      agregarAlCarrito(encontrado);
    } else {
      Alert.alert("No encontrado", "Este código de barras no existe en el stock.");
    }
  };

  const agregarAlCarrito = (prod: Producto) => {
    const existe = carrito.find(item => item.id === prod.id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      // Importante: Nos aseguramos de pasar precio_venta
      setCarrito([...carrito, { ...prod, cantidad: 1 }]);
    }
  };

  const finalizarVenta = async () => {
    if (carrito.length === 0) return;
    try {
      await registrarVenta(carrito, totalVenta);
      setCarrito([]);
      Alert.alert("Éxito", "Venta registrada correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la venta.");
    }
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.btnScanner} onPress={() => setCamaraVisible(true)}>
        <Text style={styles.btnScannerTexto}>📷 ESCANEAR PRODUCTO</Text>
      </TouchableOpacity>

      <FlatList
        data={carrito}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCarrito}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombreProd}>{item.nombre}</Text>
              <Text style={styles.detalleProd}>
                {item.cantidad} x ${item.precio_venta} {/* ← AQUÍ USAMOS EL NOMBRE CORRECTO */}
              </Text>
            </View>
            <Text style={styles.subtotalProd}>
              $ {Number(item.precio_venta) * item.cantidad}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vacio}>El carrito está vacío</Text>}
      />

      <View style={styles.footer}>
        <View style={styles.filaTotal}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalMonto}>$ {totalVenta}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.btnCobrar, { opacity: carrito.length > 0 ? 1 : 0.5 }]} 
          onPress={finalizarVenta}
          disabled={carrito.length === 0}
        >
          <Text style={styles.btnCobrarTexto}>CONFIRMAR VENTA</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL CÁMARA */}
      <Modal visible={camaraVisible} animationType="slide">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={camaraVisible ? manejarEscaneo : undefined}
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "qr", "upc_a"] }}
        >
          <View style={styles.overlayCamara}>
            <View style={styles.visor} />
            <TouchableOpacity style={styles.btnCerrar} onPress={() => setCamaraVisible(false)}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  btnScanner: { backgroundColor: '#000', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 , marginTop: 30},
  btnScannerTexto: { color: '#fff', fontWeight: 'bold' },
  itemCarrito: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
  nombreProd: { fontSize: 16, fontWeight: '500' },
  detalleProd: { fontSize: 14, color: '#666' },
  subtotalProd: { fontSize: 16, fontWeight: 'bold' },
  vacio: { textAlign: 'center', color: '#999', marginTop: 40 },
  footer: { borderTopWidth: 2, borderColor: '#eee', paddingTop: 20 },
  filaTotal: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 20, fontWeight: 'bold' },
  totalMonto: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32' },
  btnCobrar: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnCobrarTexto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  overlayCamara: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  visor: { width: 250, height: 150, borderWidth: 2, borderColor: '#fff', borderRadius: 15, marginBottom: 40 },
  btnCerrar: { backgroundColor: 'red', padding: 15, borderRadius: 10 }
});