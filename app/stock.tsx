import { CameraView } from 'expo-camera';
import React, { useState } from 'react';
import { Button, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Producto, useKiosco } from './contexto';

// 1. LISTA ACTUALIZADA CON TUS 9 SECCIONES + LA OPCIÓN 'TODAS' PARA EL FILTRO
const CATEGORIAS = ['Todas', 'Bebidas', 'Alcohol', 'Snacks', 'Golosinas', 'Almacén', 'Virtual', 'Librería', 'Higiene', 'Cigarrillos'];

export default function StockScreen() {
  const { productos, agregarProducto, actualizarProducto, eliminarProducto } = useKiosco();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [camaraVisible, setCamaraVisible] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [barcode, setBarcode] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [seccion, setSeccion] = useState('Bebidas'); // Arranca en Bebidas por defecto

  const [categoriaFiltrada, setCategoriaFiltrada] = useState('Todas');

  const abrirModal = (prod: any = null) => {
    if (prod) {
      setEsEdicion(true);
      setIdEditando(prod.id);
      setNombre(prod.nombre);
      setBarcode(prod.barcode);
      setSeccion(prod.seccion || 'Bebidas');
      setPrecio(String(prod.precio_venta ?? ''));
      setStock(String(prod.stock ?? ''));
    } else {
      setEsEdicion(false);
      setIdEditando(null);
      setNombre(''); setBarcode(''); setSeccion('Bebidas'); setPrecio(''); setStock('');
    }
    setModalVisible(true);
  };

  const guardar = () => {
    const datos = { nombre, barcode, seccion, precio, stock };
    if (esEdicion && idEditando) {
      actualizarProducto(idEditando, datos);
    } else {
      agregarProducto(datos);
    }
    setModalVisible(false);
  };

  const productosFiltrados = productos.filter((item: Producto) => {
    if (categoriaFiltrada === 'Todas') return true;
    return item.seccion === categoriaFiltrada;
  });

  // 2. PALETA DE COLORES PASTEL EXTENDIDA PARA LAS 9 SECCIONES
  const colorSeccion = (s: string) => {
    const t = s?.toLowerCase() || '';
    if (t.includes('bebidas')) return '#FFD1DC';     // Rosa pastel
    if (t.includes('alcohol')) return '#FFB7B2';     // Coral suave
    if (t.includes('snacks')) return '#E0BBE4';      // Lavanda/Violeta
    if (t.includes('golosinas')) return '#FFC6FF';   // Chicle
    if (t.includes('almacén') || t.includes('almacen')) return '#BFFCC6'; // Verde menta
    if (t.includes('virtual')) return '#97F1FF';     // Celeste agua
    if (t.includes('librería') || t.includes('libreria')) return '#FFDAC1'; // Durazno
    if (t.includes('higiene')) return '#E8FFFC';     // Turquesa muy claro
    if (t.includes('cigarrillos')) return '#DCDCDC'; // Gris claro neutro
    return '#f0f0f0';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnNuevo} onPress={() => abrirModal()}>
        <Text style={{color: '#fff', fontWeight: 'bold'}}>+ REGISTRAR PRODUCTO</Text>
      </TouchableOpacity>

      {/* BARRA DE FILTROS SUPERIOR (SOPORTA DESPLAZAMIENTO SI NO ENTRAN EN PANTALLA) */}
      <View style={styles.wrapperFiltros}>
        <FlatList
          data={CATEGORIAS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(cat) => cat}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[styles.btnFiltro, categoriaFiltrada === cat && styles.btnFiltroActivo]}
              onPress={() => setCategoriaFiltrada(cat)}
            >
              <Text style={[styles.txtFiltro, categoriaFiltrada === cat && styles.txtFiltroActivo]}>
                {cat}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Producto }) => (
          <View style={styles.card}>
            <View style={[styles.tag, {backgroundColor: colorSeccion(item.seccion)}]}>
              <Text style={styles.tagText}>{item.seccion || 'General'}</Text>
            </View>
            <View style={styles.row}>
              <View>
                <Text style={styles.nombre}>{item.nombre}</Text>
                <Text style={styles.barcodeText}>{item.barcode}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.precioText}>$ {item.precio_venta}</Text>
                <Text style={styles.stockText}>Stock: {item.stock}</Text>
              </View>
            </View>
            <View style={styles.acciones}>
              <TouchableOpacity onPress={() => abrirModal(item)}><Text style={styles.btnEdit}>EDITAR</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarProducto(item.id)}><Text style={styles.btnDel}>BORRAR</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>{esEdicion ? 'Editar Item' : 'Nuevo Registro'}</Text>
            <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
            
            <View style={styles.rowScanner}>
              <TextInput style={[styles.input, {flex:1}]} placeholder="Código" value={barcode} onChangeText={setBarcode} />
              <TouchableOpacity onPress={() => setCamaraVisible(true)} style={styles.btnCam}><Text>📷</Text></TouchableOpacity>
            </View>

            {/* SELECTOR DE SECCIÓN INTEGRADO (MUESTRA LAS 9 OPCIONES EN MALLA/REJILLA) */}
            <Text style={styles.labelModal}>Sección:</Text>
            <View style={styles.selectorSeccionContainer}>
              {CATEGORIAS.filter(c => c !== 'Todas').map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.opcionSeccion, seccion === cat && { backgroundColor: colorSeccion(cat), borderColor: '#000' }]}
                  onPress={() => setSeccion(cat)}
                >
                  <Text style={[styles.txtOpcion, seccion === cat && { fontWeight: 'bold' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.input} placeholder="Precio" value={precio} onChangeText={setPrecio} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Stock" value={stock} onChangeText={setStock} keyboardType="numeric" />
            
            <View style={styles.rowActions}>
              <Button title="Cancelar" color="red" onPress={() => setModalVisible(false)} />
              <Button title="Guardar" onPress={guardar} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={camaraVisible}>
        <CameraView 
          style={{flex:1}} 
          onBarcodeScanned={({data}) => { setBarcode(data); setCamaraVisible(false); }}
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "qr", "upc_a"] }}
        >
          <TouchableOpacity onPress={() => setCamaraVisible(false)} style={styles.btnCerrarCam}><Text style={{color:'#fff'}}>VOLVER</Text></TouchableOpacity>
        </CameraView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  btnNuevo: { backgroundColor: '#000', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  wrapperFiltros: { marginBottom: 15, backgroundColor: '#f5f5f5', padding: 5, borderRadius: 10 },
  btnFiltro: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginRight: 5 },
  btnFiltroActivo: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: {width:0, height:1}, shadowOpacity:0.1, elevation:2 },
  txtFiltro: { fontSize: 13, color: '#666' },
  txtFiltroActivo: { color: '#000', fontWeight: 'bold' },
  card: { padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginBottom: 5 },
  tagText: { fontSize: 10, fontWeight: 'bold', color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowScanner: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  nombre: { fontSize: 18, fontWeight: '500' },
  barcodeText: { fontSize: 12, color: '#999' },
  precioText: { fontSize: 20, fontWeight: 'bold' },
  stockText: { color: 'red', fontWeight: 'bold', fontSize: 12 },
  acciones: { flexDirection: 'row', gap: 20, marginTop: 10 },
  btnEdit: { color: '#007AFF', fontWeight: 'bold' },
  btnDel: { color: 'red', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  labelModal: { fontSize: 14, color: '#666', marginBottom: 8, fontWeight: '500' },
  selectorSeccionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 15 },
  opcionSeccion: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  txtOpcion: { fontSize: 12, color: '#444' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 8, fontSize: 16 },
  btnCam: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10, marginLeft: 10 },
  rowActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
  btnCerrarCam: { position: 'absolute', bottom: 50, alignSelf: 'center', backgroundColor: 'red', padding: 15, borderRadius: 10 }
});