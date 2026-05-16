import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>¡AL FIN ARRANCÓ COSMOS!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6F4FE', alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20, fontWeight: 'bold', color: '#333' }
});