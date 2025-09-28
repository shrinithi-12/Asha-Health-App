import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LanguageSelection from './src/screens/LanguageSelection';
import RoleSelection from './src/screens/RoleSelection';
import ASHARegistration from './src/screens/ASHARegistration';
import ASHADashboard from './src/screens/ASHADashboard';
import PHCRegistration from './src/screens/PHCRegistration';
import PHCDashboard from './src/screens/PHCDashboard';
import RegisterPregnancy from './src/screens/RegisterPregnancy';
import ChildHealth from './src/screens/ChildHealth';
import FamilyPlanning from './src/screens/FamilyPlanning';
import DiseaseSurveillance from './src/screens/DiseaseSurveillance';
import Referrals from './src/screens/Referrals';
import HealthAwareness from './src/screens/HealthAwareness';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LanguageSelection" 
        screenOptions={{
          headerStyle: { backgroundColor: '#e6f2ff' },
          headerTintColor: '#0073e6'
        }}>
        <Stack.Screen name="LanguageSelection" component={LanguageSelection} options={{ headerShown: false }} />
        <Stack.Screen name="RoleSelection" component={RoleSelection} />
        <Stack.Screen name="ASHARegistration" component={ASHARegistration} />
        <Stack.Screen name="ASHADashboard" component={ASHADashboard} />
        <Stack.Screen name="PHCRegistration" component={PHCRegistration} />
        <Stack.Screen name="PHCDashboard" component={PHCDashboard} />
        <Stack.Screen name="RegisterPregnancy" component={RegisterPregnancy} />
        <Stack.Screen name="ChildHealth" component={ChildHealth} />
        <Stack.Screen name="FamilyPlanning" component={FamilyPlanning} />
        <Stack.Screen name="DiseaseSurveillance" component={DiseaseSurveillance} />
        <Stack.Screen name="Referrals" component={Referrals} />
        <Stack.Screen name="HealthAwareness" component={HealthAwareness} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
