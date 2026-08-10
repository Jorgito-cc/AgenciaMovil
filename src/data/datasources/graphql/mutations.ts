import { gql } from '@apollo/client';

// ============================================================
// MUTATIONS - FastAPI (Python) - Autenticación y Biometría
// Backend: FastAPI Python (localhost:8000/graphql) - default
// ============================================================

/** Registro con video biométrico */
export const REGISTER_USER_WITH_VIDEO = gql`
  mutation RegisterUserWithVideo(
    $nombre: String!
    $apellido: String!
    $email: String!
    $password: String!
    $telefono: String!
    $videoBase64: String!
    $videoFramesBase64: [String!]!
  ) {
    registerUserWithVideo(
      nombre: $nombre
      apellido: $apellido
      email: $email
      password: $password
      telefono: $telefono
      videoBase64: $videoBase64
      videoFramesBase64: $videoFramesBase64
    ) {
      success
      message
      username
      embeddingQuality
      token
      error
    }
  }
`;

/** Login con contraseña */
export const LOGIN_WITH_PASSWORD = gql`
  mutation LoginUserWithPassword($email: String!, $password: String!) {
    loginUserWithPassword(email: $email, password: $password) {
      success
      message
      username
      similarity
      confidence
      token
      error
    }
  }
`;

/** Login con imagen biométrica (reconocimiento facial) */
export const LOGIN_WITH_IMAGE = gql`
  mutation LoginUserWithImage($email: String!, $imageBase64: String!) {
    loginUserWithImage(email: $email, imageBase64: $imageBase64) {
      success
      message
      username
      similarity
      confidence
      token
      error
    }
  }
`;

/** Enlazar biometría a cuenta existente */
export const LINK_BIOMETRIC_WITH_VIDEO = gql`
  mutation LinkBiometricWithVideo(
    $email: String!
    $videoBase64: String!
    $videoFramesBase64: [String!]!
  ) {
    linkBiometricWithVideo(
      email: $email
      videoBase64: $videoBase64
      videoFramesBase64: $videoFramesBase64
    ) {
      success
      message
      username
      embeddingQuality
      token
      error
    }
  }
`;

// ============================================================
// MUTATIONS - FastAPI (Python) - IA y Chatbot
// ============================================================

export const CHATBOT_CONSULTAR = gql`
  mutation ChatbotConsultar($mensajeTexto: String, $audioBase64: String) {
    chatbotConsultar(mensajeTexto: $mensajeTexto, audioBase64: $audioBase64) {
      success
      respuesta
      transcripcion
      error
    }
  }
`;

// ============================================================
// MUTATIONS - Spring Boot (Java) - Datos de Negocio
// Backend: Spring Boot (localhost:8080/graphql)
// Context: { clientName: 'springboot' }
// ============================================================

// ── ROL ──────────────────────────────────────────────────────

export const CREAR_ROL = gql`
  mutation CrearRol($nombre: String, $description: String) {
    crearRol(nombre: $nombre, description: $description) {
      id
      nombre
      description
    }
  }
`;

export const ACTUALIZAR_ROL = gql`
  mutation ActualizarRol($id: UUID!, $nombre: String, $description: String) {
    actualizarRol(id: $id, nombre: $nombre, description: $description) {
      id
      nombre
      description
    }
  }
`;

export const ELIMINAR_ROL = gql`
  mutation EliminarRol($id: UUID!) {
    eliminarRol(id: $id)
  }
`;

// ── EMPRESA ──────────────────────────────────────────────────

export const CREAR_EMPRESA = gql`
  mutation CrearEmpresa(
    $nombreLegal: String
    $nombreComercial: String
    $nit: Int
    $direccion: String
    $celular: Int
  ) {
    crearEmpresa(
      nombre_legal: $nombreLegal
      nombre_comercial: $nombreComercial
      nit: $nit
      direccion: $direccion
      celular: $celular
    ) {
      id
      nombre_legal
      nombre_comercial
      nit
      direccion
      celular
    }
  }
`;

export const ACTUALIZAR_EMPRESA = gql`
  mutation ActualizarEmpresa(
    $id: UUID!
    $nombreLegal: String
    $nombreComercial: String
    $nit: Int
    $direccion: String
    $celular: Int
  ) {
    actualizarEmpresa(
      id: $id
      nombre_legal: $nombreLegal
      nombre_comercial: $nombreComercial
      nit: $nit
      direccion: $direccion
      celular: $celular
    ) {
      id
      nombre_legal
      nombre_comercial
      nit
      direccion
      celular
    }
  }
`;

export const ELIMINAR_EMPRESA = gql`
  mutation EliminarEmpresa($id: UUID!) {
    eliminarEmpresa(id: $id)
  }
`;

// ── TRABAJOS ─────────────────────────────────────────────────

export const CREAR_TRABAJO = gql`
  mutation CrearTrabajo($nombre: String, $codigo: String) {
    crearTrabajo(nombre: $nombre, codigo: $codigo) {
      id
      nombre
      codigo
    }
  }
`;

export const ACTUALIZAR_TRABAJO = gql`
  mutation ActualizarTrabajo($id: UUID!, $nombre: String, $codigo: String) {
    actualizarTrabajo(id: $id, nombre: $nombre, codigo: $codigo) {
      id
      nombre
      codigo
    }
  }
`;

export const ELIMINAR_TRABAJO = gql`
  mutation EliminarTrabajo($id: UUID!) {
    eliminarTrabajo(id: $id)
  }
`;

// ── CATEGORIA ────────────────────────────────────────────────

export const CREAR_CATEGORIA = gql`
  mutation CrearCategoria($nombre: String) {
    crearCategoria(nombre: $nombre) {
      id
      nombre
    }
  }
`;

export const ACTUALIZAR_CATEGORIA = gql`
  mutation ActualizarCategoria($id: UUID!, $nombre: String) {
    actualizarCategoria(id: $id, nombre: $nombre) {
      id
      nombre
    }
  }
`;

export const ELIMINAR_CATEGORIA = gql`
  mutation EliminarCategoria($id: UUID!) {
    eliminarCategoria(id: $id)
  }
`;

// ── USUARIO ──────────────────────────────────────────────────

export const CREAR_USUARIO = gql`
  mutation CrearUsuario(
    $nombre: String
    $apellido: String
    $email: String
    $password: String
    $telefono: String
    $rolId: UUID
    $estado: String
  ) {
    crearUsuario(
      nombre: $nombre
      apellido: $apellido
      email: $email
      password: $password
      telefono: $telefono
      rol_id: $rolId
      estado: $estado
    ) {
      id
      nombre
      apellido
      email
      telefono
      rolObj {
        id
        nombre
      }
      estado
    }
  }
`;

export const ACTUALIZAR_USUARIO = gql`
  mutation ActualizarUsuario(
    $id: UUID!
    $nombre: String
    $apellido: String
    $email: String
    $telefono: String
    $rolId: UUID
    $estado: String
  ) {
    actualizarUsuario(
      id: $id
      nombre: $nombre
      apellido: $apellido
      email: $email
      telefono: $telefono
      rol_id: $rolId
      estado: $estado
    ) {
      id
      nombre
      apellido
      email
      telefono
      rolObj {
        id
        nombre
      }
      estado
    }
  }
`;

export const ELIMINAR_USUARIO = gql`
  mutation EliminarUsuario($id: UUID!) {
    eliminarUsuario(id: $id)
  }
`;

// ── RECLUTADOR ───────────────────────────────────────────────

export const CREAR_RECLUTADOR = gql`
  mutation CrearReclutador(
    $nombre: String
    $apellido: String
    $email: String
    $password: String
    $telefono: Int
    $cargo: String
    $empresaId: UUID
    $estado: String
  ) {
    crearReclutador(
      nombre: $nombre
      apellido: $apellido
      email: $email
      password: $password
      telefono: $telefono
      cargo: $cargo
      empresa_id: $empresaId
      estado: $estado
    ) {
      id
      nombre
      apellido
      email
      telefono
      telefonoReclutador
      cargo
      empresa {
        id
        nombre_comercial
      }
      estado
    }
  }
`;

export const ACTUALIZAR_RECLUTADOR = gql`
  mutation ActualizarReclutador(
    $id: UUID!
    $nombre: String
    $apellido: String
    $email: String
    $telefono: Int
    $cargo: String
    $empresaId: UUID
    $estado: String
  ) {
    actualizarReclutador(
      id: $id
      nombre: $nombre
      apellido: $apellido
      email: $email
      telefono: $telefono
      cargo: $cargo
      empresa_id: $empresaId
      estado: $estado
    ) {
      id
      nombre
      apellido
      email
      telefono
      telefonoReclutador
      cargo
      empresa {
        id
        nombre_comercial
      }
      estado
    }
  }
`;

export const ELIMINAR_RECLUTADOR = gql`
  mutation EliminarReclutador($id: UUID!) {
    eliminarReclutador(id: $id)
  }
`;

// ── CANDIDATO ────────────────────────────────────────────────

export const CREAR_CANDIDATO = gql`
  mutation CrearCandidato(
    $nombre: String
    $apellido: String
    $email: String
    $password: String
    $registro: Int
    $sueldoEsperado: Float
    $modalidadPreferida: String
    $nivelEducativo: String
    $nacionalidad: String
    $clusterId: Int
    $estado: String
  ) {
    crearCandidato(
      nombre: $nombre
      apellido: $apellido
      email: $email
      password: $password
      registro: $registro
      sueldo_esperado: $sueldoEsperado
      modalidad_preferida: $modalidadPreferida
      nivel_educativo: $nivelEducativo
      nacionalidad: $nacionalidad
      cluster_id: $clusterId
      estado: $estado
    ) {
      id
      nombre
      apellido
      email
      registro
      sueldo_esperado
      modalidad_preferida
      nivel_educativo
      nacionalidad
      cluster_id
      estado
    }
  }
`;

export const ACTUALIZAR_CANDIDATO = gql`
  mutation ActualizarCandidato(
    $id: UUID!
    $nombre: String
    $apellido: String
    $email: String
    $registro: Int
    $sueldoEsperado: Float
    $modalidadPreferida: String
    $nivelEducativo: String
    $nacionalidad: String
    $clusterId: Int
    $estado: String
  ) {
    actualizarCandidato(
      id: $id
      nombre: $nombre
      apellido: $apellido
      email: $email
      registro: $registro
      sueldo_esperado: $sueldoEsperado
      modalidad_preferida: $modalidadPreferida
      nivel_educativo: $nivelEducativo
      nacionalidad: $nacionalidad
      cluster_id: $clusterId
      estado: $estado
    ) {
      id
      nombre
      apellido
      email
      registro
      sueldo_esperado
      modalidad_preferida
      nivel_educativo
      nacionalidad
      cluster_id
      estado
    }
  }
`;

export const ELIMINAR_CANDIDATO = gql`
  mutation EliminarCandidato($id: UUID!) {
    eliminarCandidato(id: $id)
  }
`;

// ── OFERTA ───────────────────────────────────────────────────

export const CREAR_OFERTA = gql`
  mutation CrearOferta(
    $titulo: String
    $descripcion: String
    $contrato: String
    $requisitos: String
    $experienciaTiempo: Int
    $modalidadTrabajo: String
    $estado: String
    $sueldo: Float
    $clusterId: Int
    $categoriaId: UUID
    $reclutadorId: UUID
  ) {
    crearOferta(
      titulo: $titulo
      descripcion: $descripcion
      contrato: $contrato
      requisitos: $requisitos
      experiencia_tiempo: $experienciaTiempo
      modalidad_trabajo: $modalidadTrabajo
      estado: $estado
      sueldo: $sueldo
      cluster_id: $clusterId
      categoria_id: $categoriaId
      reclutador_id: $reclutadorId
    ) {
      id
      titulo
      descripcion
      contrato
      estado
      sueldo
      fecha_publicacion
    }
  }
`;

export const ACTUALIZAR_OFERTA = gql`
  mutation ActualizarOferta(
    $id: UUID!
    $titulo: String
    $descripcion: String
    $contrato: String
    $requisitos: String
    $experienciaTiempo: Int
    $modalidadTrabajo: String
    $estado: String
    $sueldo: Float
    $clusterId: Int
    $categoriaId: UUID
    $reclutadorId: UUID
  ) {
    actualizarOferta(
      id: $id
      titulo: $titulo
      descripcion: $descripcion
      contrato: $contrato
      requisitos: $requisitos
      experiencia_tiempo: $experienciaTiempo
      modalidad_trabajo: $modalidadTrabajo
      estado: $estado
      sueldo: $sueldo
      cluster_id: $clusterId
      categoria_id: $categoriaId
      reclutador_id: $reclutadorId
    ) {
      id
      titulo
      descripcion
      contrato
      estado
      sueldo
    }
  }
`;

export const ELIMINAR_OFERTA = gql`
  mutation EliminarOferta($id: UUID!) {
    eliminarOferta(id: $id)
  }
`;

// ── POSTULACION ──────────────────────────────────────────────

export const CREAR_POSTULACION = gql`
  mutation CrearPostulacion(
    $faseAlcanzada: String
    $idCv: String
    $candidatoId: UUID
    $ofertaId: UUID
  ) {
    crearPostulacion(
      fase_alcanzada: $faseAlcanzada
      id_cv: $idCv
      candidato_id: $candidatoId
      oferta_id: $ofertaId
    ) {
      id
      fecha
      fase_alcanzada
      id_cv
      candidato {
        id
        nombre
      }
      oferta {
        id
        titulo
      }
    }
  }
`;

export const ACTUALIZAR_POSTULACION = gql`
  mutation ActualizarPostulacion(
    $id: UUID!
    $faseAlcanzada: String
    $idCv: String
    $candidatoId: UUID
    $ofertaId: UUID
  ) {
    actualizarPostulacion(
      id: $id
      fase_alcanzada: $faseAlcanzada
      id_cv: $idCv
      candidato_id: $candidatoId
      oferta_id: $ofertaId
    ) {
      id
      fecha
      fase_alcanzada
      id_cv
    }
  }
`;

export const ELIMINAR_POSTULACION = gql`
  mutation EliminarPostulacion($id: UUID!) {
    eliminarPostulacion(id: $id)
  }
`;

// ── HABILIDADES ──────────────────────────────────────────────

export const CREAR_HABILIDAD = gql`
  mutation CrearHabilidad($nombre: String) {
    crearHabilidad(nombre: $nombre) {
      id
      nombre
    }
  }
`;

export const ACTUALIZAR_HABILIDAD = gql`
  mutation ActualizarHabilidad($id: UUID!, $nombre: String) {
    actualizarHabilidad(id: $id, nombre: $nombre) {
      id
      nombre
    }
  }
`;

export const ELIMINAR_HABILIDAD = gql`
  mutation EliminarHabilidad($id: UUID!) {
    eliminarHabilidad(id: $id)
  }
`;

// ── CANDIDATO_HABILIDAD ──────────────────────────────────────

export const CREAR_CANDIDATO_HABILIDAD = gql`
  mutation CrearCandidatoHabilidad($candidatoId: UUID, $habilidadId: UUID) {
    crearCandidatoHabilidad(candidato_id: $candidatoId, habilidad_id: $habilidadId) {
      id
      candidato {
        id
        nombre
      }
      habilidad {
        id
        nombre
      }
    }
  }
`;

export const ELIMINAR_CANDIDATO_HABILIDAD = gql`
  mutation EliminarCandidatoHabilidad($id: UUID!) {
    eliminarCandidatoHabilidad(id: $id)
  }
`;

// ── OFERTA_HABILIDAD ─────────────────────────────────────────

export const CREAR_OFERTA_HABILIDAD = gql`
  mutation CrearOfertaHabilidad(
    $nivelImportancia: String
    $ofertaId: UUID
    $habilidadId: UUID
  ) {
    crearOfertaHabilidad(
      nivel_importancia: $nivelImportancia
      oferta_id: $ofertaId
      habilidad_id: $habilidadId
    ) {
      id
      nivel_importancia
      oferta {
        id
        titulo
      }
      habilidad {
        id
        nombre
      }
    }
  }
`;

export const ACTUALIZAR_OFERTA_HABILIDAD = gql`
  mutation ActualizarOfertaHabilidad(
    $id: UUID!
    $nivelImportancia: String
    $ofertaId: UUID
    $habilidadId: UUID
  ) {
    actualizarOfertaHabilidad(
      id: $id
      nivel_importancia: $nivelImportancia
      oferta_id: $ofertaId
      habilidad_id: $habilidadId
    ) {
      id
      nivel_importancia
    }
  }
`;

export const ELIMINAR_OFERTA_HABILIDAD = gql`
  mutation EliminarOfertaHabilidad($id: UUID!) {
    eliminarOfertaHabilidad(id: $id)
  }
`;

// ── OFERTA_TRABAJO ───────────────────────────────────────────

export const CREAR_OFERTA_TRABAJO = gql`
  mutation CrearOfertaTrabajo($ofertaId: UUID, $trabajoId: UUID) {
    crearOfertaTrabajo(oferta_id: $ofertaId, trabajo_id: $trabajoId) {
      id
      oferta {
        id
        titulo
      }
      trabajos {
        id
        nombre
      }
    }
  }
`;

export const ELIMINAR_OFERTA_TRABAJO = gql`
  mutation EliminarOfertaTrabajo($id: UUID!) {
    eliminarOfertaTrabajo(id: $id)
  }
`;

// ── MACHINE LEARNING (Spring Boot) ───────────────────────────

export const DISPARAR_ENTRENAMIENTO_KMEANS = gql`
  mutation DispararEntrenamientoKMeansManual {
    dispararEntrenamientoKMeansManual
  }
`;

export const CLASIFICAR_CANDIDATO_ML = gql`
  mutation ClasificarCandidato($id: UUID!) {
    clasificarCandidato(id: $id)
  }
`;

export const CLASIFICAR_OFERTA_ML = gql`
  mutation ClasificarOferta($id: UUID!) {
    clasificarOferta(id: $id)
  }
`;

export const DISPARAR_ENTRENAMIENTO_RF = gql`
  mutation DispararEntrenamientoRandomForestManual {
    dispararEntrenamientoRandomForestManual
  }
`;

export const PREDECIR_EXITO_POSTULACION = gql`
  mutation PredecirExitoPostulacion($id: UUID!) {
    predecirExitoPostulacion(id: $id)
  }
`;

// ── REGISTRO DISTRIBUIDO (Spring Boot → Python) ──────────────

export const CREATE_USER_FROM_PYTHON = gql`
  mutation CreateUserFromPython($input: CreateUserFromPythonInput!) {
    createUserFromPython(input: $input) {
      success
      userId
      message
    }
  }
`;

export const ACTUALIZAR_VIDEO_ID = gql`
  mutation ActualizarVideoId($id: UUID!, $videoId: String!) {
    actualizarVideoId(id: $id, videoId: $videoId) {
      id
      nombre
      apellido
      email
    }
  }
`;

/** Extracción de CV usando IA en FastAPI */
export const READ_CV_FROM_IMAGE = gql`
  mutation ReadCvFromImage($imageBase64: String!, $token: String!) {
    readCvFromImage(imageBase64: $imageBase64, token: $token) {
      success
      message
      nombre
      apellido
      email
      telefono
      sueldoEsperado
      modalidadPreferida
      nivelEducativo
      nacionalidad
      mesesExperienciaTotal
      habilidades
      error
    }
  }
`;
