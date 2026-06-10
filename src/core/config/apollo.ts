import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

// URLs de los backends
// Para dispositivo físico, usa la IP local de tu máquina (ej: 192.168.0.6)
// Para emulador Android, usa 10.0.2.2
const FASTAPI_URL = 'http://192.168.0.6:8083/graphql';
const SPRING_BOOT_URL = 'http://192.168.0.6:8082/graphql';
const NESTJS_URL = 'http://192.168.0.6:3000/graphql';

// Link para NestJS (Archivos, Auditoría)
const nestJsLink = new HttpLink({
  uri: NESTJS_URL,
});

// Link para FastAPI (autenticación biométrica, ML)
const fastApiLink = new HttpLink({
  uri: FASTAPI_URL,
});

// Link para Spring Boot (CRUD, datos de negocio)
const springBootLink = new HttpLink({
  uri: SPRING_BOOT_URL,
});

import * as SecureStore from 'expo-secure-store';
import { setContext } from '@apollo/client/link/context';

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('auth_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Directiva para seleccionar backend basado en contexto
const directionalLink = ApolloLink.split(
  (operation) => operation.getContext().clientName === 'springboot',
  springBootLink,
  ApolloLink.split(
    (operation) => operation.getContext().clientName === 'nestjs',
    nestJsLink,
    fastApiLink
  )
);

// Cliente Apollo principal
export const apolloClient = new ApolloClient({
  link: authLink.concat(directionalLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    mutate: {
      fetchPolicy: 'no-cache',
    },
  },
});

// Exportar URLs para referencia
export { FASTAPI_URL, SPRING_BOOT_URL, NESTJS_URL };
