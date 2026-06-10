# Cliente Movil - AgencyClient

Este proyecto es la aplicacion movil de la plataforma de reclutamiento, desarrollada con React Native, Expo y TypeScript. La aplicacion cuenta con interfaces dedicadas para Candidatos y Reclutadores, e integra autenticacion biometrica (reconocimiento facial) mediante un backend especializado en inteligencia artificial.

## Arquitectura de Integracion

La aplicacion movil consume servicios de tres backends diferentes en funcion del contexto de la operacion, coordinados a traves de Apollo Client:

* FastAPI (Python): Administra la autenticacion, el registro de candidatos mediante video, y la validacion de biometria facial utilizando modelos de vision por computadora (como YOLOv8).
* Spring Boot (Java): Gestiona la logica de negocio principal (ofertas de trabajo, postulaciones, usuarios de negocio como Reclutador/Administrador) y la persistencia de datos transaccionales en DynamoDB.
* NestJS (Node.js): Funciona como servidor de recursos protegidos, encargandose de la carga y descarga segura de documentos en Amazon S3.

## Estructura de Carpetas

El codigo fuente principal se organiza dentro del directorio src:

* src/core/config: Configuraciones basicas de la aplicacion, incluyendo la definicion del cliente Apollo y el enrutamiento dinamico de peticiones de GraphQL a los respectivos servidores backend (FastAPI, Spring Boot y NestJS).
* src/core/context: Proveedores de contexto global, destacando AuthContext para la persistencia segura del token de sesion mediante SecureStore.
* src/data/datasources/graphql: Archivos que contienen las definiciones de queries y mutations de GraphQL que consume el aplicativo.
* src/presentation/navigation: Configuracion del flujo de navegacion utilizando React Navigation:
  * RootNavigator: Determina si se muestra el flujo de autenticacion o el respectivo panel segun el rol del usuario logueado.
  * AuthNavigator: Flujo para usuarios no autenticados (pantallas de bienvenida, login y registro).
  * CandidateTabNavigator: Flujo principal por pestañas para el modulo del Candidato.
  * RecruiterTabNavigator: Flujo principal por pestañas para el modulo del Reclutador.
* src/presentation/screens: Pantallas de la aplicacion movil, divididas por modulos:
  * auth: Pantallas de autenticacion (Bienvenida, Inicio de Sesion, Registro con soporte de grabacion de video).
  * candidate: Pantallas orientadas al postulante (Perfil, Ofertas de Trabajo, Mis Postulaciones, Configuracion Biometrica).
  * recruiter: Pantallas de administracion de procesos de seleccion (Tablero Principal, Categorias, Pipeline de Candidatos, Detalle de Postulaciones).

## Requisitos Previos

Para ejecutar este proyecto de forma local, es necesario contar con:

* Node.js (Version LTS recomendada)
* Expo CLI instalado globalmente o mediante npx
* Dispositivo movil con la aplicacion Expo Go instalada (para pruebas fisicas) o un emulador configurado (Android Studio / Xcode)

## Instalacion y Configuracion

1. Instalar las dependencias del proyecto:
   npm install

2. Configurar las direcciones de red para los Backends:
   Edita el archivo src/core/config/apollo.ts para ajustar las direcciones IP locales de tu maquina para cada servicio:
   * FASTAPI_URL
   * SPRING_BOOT_URL
   * NESTJS_URL
   
   Nota: Si realizas pruebas en un dispositivo fisico, debes ingresar la direccion IP de tu red local (por ejemplo, http://192.168.1.15:8083/graphql). Si usas el emulador de Android integrado, la IP de loopback corresponde a http://10.0.2.2.

## Ejecucion del Proyecto

Para iniciar el servidor de desarrollo de Expo, ejecuta el siguiente comando:

* Iniciar servidor de desarrollo:
  npm start

Una vez que el servidor este en ejecucion, puedes correr la aplicacion en diferentes plataformas mediante los atajos correspondientes o los siguientes comandos:

* Ejecutar en Android:
  npm run android

* Ejecutar en iOS:
  npm run ios

* Ejecutar en Web:
  npm run web

## Seguridad y Variables de Entorno

Este proyecto cuenta con filtros estrictos en .gitignore para evitar la inclusion accidental de credenciales o configuraciones locales sensibles. Toda variable de entorno configurada mediante archivos .env o sus variantes locales (.env.local, .env.development, etc.) no seran subidas al repositorio de control de versiones.
