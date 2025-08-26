import React, { useEffect, useState, useMemo } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import DashboardScreen from "./src/screens/DashboardScreen";
import ClientsScreen from "./src/screens/ClientsScreen";
import AgendaScreen from "./src/screens/AgendaScreen";
import FinanceScreen from "./src/screens/FinanceScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import LoginScreen from "./src/screens/LoginScreen";
import { migrate, db, hash, uuid } from "./src/db";
import { Text } from "react-native";

const Tab = createBottomTabNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => { migrate(); setReady(true); }, []);

  const auth = useMemo(() => ({
    async signup(email, name, password) {
      const hashPw = await hash(password);
      await db.runAsync(
        "INSERT INTO users(id,email,name,password_hash,created_at) VALUES(?,?,?,?,?)",
        [uuid(), email.toLowerCase(), name, hashPw, new Date().toISOString()]
      );
      const row = await db.getFirstAsync("SELECT id FROM users WHERE email=?", [email.toLowerCase()]);
      setUserId(row?.id);
    },
    async login(email, password) {
      const row = await db.getFirstAsync("SELECT * FROM users WHERE email=?", [email.toLowerCase()]);
      if (!row) throw new Error("UsuÃ¡ria nÃ£o encontrada.");
      const h = await hash(password);
      if (h !== row.password_hash) throw new Error("Senha incorreta.");
      setUserId(row.id);
    },
    logout(){ setUserId(null); }
  }), []);

  if (!ready) return <Text>Carregandoâ€¦</Text>;

  return (
    <SafeAreaProvider>
      {userId ? (
        <NavigationContainer>
          <Tab.Navigator screenOptions={{ headerShown:false }}>
            <Tab.Screen name="InÃ­cio" component={DashboardScreen}/>
            <Tab.Screen name="Clientes" component={ClientsScreen}/>
            <Tab.Screen name="Agenda" component={AgendaScreen}/>
            <Tab.Screen name="Financeiro" component={FinanceScreen}/>
            <Tab.Screen name="Perfil" component={ProfileScreen}/>
          </Tab.Navigator>
        </NavigationContainer>
      ) : (
        <LoginScreen onAuth={setUserId} auth={auth}/>
      )}
    </SafeAreaProvider>
  );
}
