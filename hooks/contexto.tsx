import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../constants/supabase';

export interface Producto {
  id: string;
  nombre: string;
  barcode: string;
  seccion: string;
  precio_venta: number;
  stock: number;
}

const KioscoContext = createContext<any>(null);

export function KioscoProvider({ children }: { children: React.ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventasHoy, setVentasHoy] = useState<any[]>([]);
  const [totalCaja, setTotalCaja] = useState(0);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    await fetchDatos();
    await obtenerVentasDelDia();
  };

  const fetchDatos = async () => {
    const { data, error } = await supabase.from('productos').select('*').order('nombre');
    if (error) console.error("Error productos:", error);
    
    const mapeados = data?.map((p: any) => ({
      ...p,
      precio_venta: Number(p.precio_venta) || 0,
      stock: Number(p.stock) || 0
    })) || [];
    
    setProductos(mapeados);
  };

  const obtenerVentasDelDia = async () => {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('created_at', inicioHoy.toISOString())
      .order('created_at', { ascending: false });

    if (data) {
      setVentasHoy(data);
      const suma = data.reduce((acc, v) => acc + Number(v.total), 0);
      setTotalCaja(suma);
    }
  };

  const obtenerDetallesVenta = async (ventaId: string) => {
    const { data, error } = await supabase
      .from('detalle_ventas')
      .select('*')
      .eq('venta_id', ventaId);
    
    if (error) {
      console.error("❌ ERROR REAL DE SUPABASE DETALLES:", error.message);
      return [];
    }
    return data || [];
  };

  const registrarVenta = async (carrito: any[], total: number) => {
    try {
      const { data: ventaRealizada, error: errorVenta } = await supabase
        .from('ventas')
        .insert([{ total: total }])
        .select()
        .single();

      if (errorVenta) throw errorVenta;

      for (const item of carrito) {
        await supabase.from('detalle_ventas').insert([{
          venta_id: ventaRealizada.id,
          producto_id: item.id,
          nombre_producto: item.nombre,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta
        }]);

        await supabase
          .from('productos')
          .update({ stock: item.stock - item.cantidad })
          .eq('id', item.id);
      }

      await cargarTodo();
      return { success: true };
    } catch (error: any) {
      console.error("Error en operación de venta:", error.message);
      throw error;
    }
  };

  const agregarProducto = async (nuevo: any) => {
    const { error } = await supabase.from('productos').insert([{
      nombre: nuevo.nombre,
      barcode: nuevo.barcode,
      seccion: nuevo.seccion,
      precio_venta: Number(nuevo.precio) || 0,
      stock: Number(nuevo.stock) || 0
    }]);
    if (!error) cargarTodo();
    else Alert.alert("Error al agregar", error.message);
  };

  const actualizarProducto = async (id: string, datos: any) => {
    const { error } = await supabase.from('productos').update({
      nombre: datos.nombre,
      barcode: datos.barcode,
      seccion: datos.seccion,
      precio_venta: Number(datos.precio) || 0,
      stock: Number(datos.stock) || 0
    }).eq('id', id);
    if (!error) cargarTodo();
    else Alert.alert("Error al actualizar", error.message);
  };

  const eliminarProducto = async (id: string) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) cargarTodo();
  };

  return (
    <KioscoContext.Provider value={{ 
      productos, ventasHoy, totalCaja, 
      agregarProducto, actualizarProducto, eliminarProducto, 
      registrarVenta, obtenerVentasDelDia, obtenerDetallesVenta 
    }}>
      {children}
    </KioscoContext.Provider>
  );
}

export const useKiosco = () => useContext(KioscoContext);