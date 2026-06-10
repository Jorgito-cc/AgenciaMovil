import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ApolloProvider } from '@apollo/client/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { apolloClient } from './src/core/config/apollo';
import { AuthProvider } from './src/core/context/AuthContext';
import RootNavigator from './src/presentation/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ApolloProvider client={apolloClient}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </ApolloProvider>
    </AuthProvider>
  );
}
