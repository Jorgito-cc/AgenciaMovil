import { gql } from '@apollo/client';

// ============================================================
// QUERIES - Spring Boot (Java) - Datos de Negocio
// Context: { clientName: 'springboot' }
// ============================================================

// ── USUARIO ──────────────────────────────────────────────────

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
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

export const LISTAR_USUARIOS = gql`
  query ListarUsuarios {
    listarUsuarios {
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

export const OBTENER_USUARIO = gql`
  query ObtenerUsuario($id: UUID!) {
    obtenerUsuario(id: $id) {
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

// ── ROL ──────────────────────────────────────────────────────

export const LISTAR_ROLES = gql`
  query ListarRoles {
    listarRoles {
      id
      nombre
      description
    }
  }
`;

export const OBTENER_ROL = gql`
  query ObtenerRol($id: UUID!) {
    obtenerRol(id: $id) {
      id
      nombre
      description
    }
  }
`;

// ── EMPRESA ──────────────────────────────────────────────────

export const LISTAR_EMPRESAS = gql`
  query ListarEmpresas {
    listarEmpresas {
      id
      nombre_legal
      nombre_comercial
      nit
      direccion
      celular
    }
  }
`;

export const OBTENER_EMPRESA = gql`
  query ObtenerEmpresa($id: UUID!) {
    obtenerEmpresa(id: $id) {
      id
      nombre_legal
      nombre_comercial
      nit
      direccion
      celular
    }
  }
`;

// ── RECLUTADOR ───────────────────────────────────────────────

export const LISTAR_RECLUTADORES = gql`
  query ListarReclutadores {
    listarReclutadores {
      id
      nombre
      apellido
      email
      telefono
      telefonoReclutador
      cargo
      empresa {
        id
        nombre_legal
        nombre_comercial
      }
      estado
    }
  }
`;

export const OBTENER_RECLUTADOR = gql`
  query ObtenerReclutador($id: UUID!) {
    obtenerReclutador(id: $id) {
      id
      nombre
      apellido
      email
      telefono
      telefonoReclutador
      cargo
      empresa {
        id
        nombre_legal
        nombre_comercial
      }
      estado
    }
  }
`;

// ── CANDIDATO ────────────────────────────────────────────────

export const LISTAR_CANDIDATOS = gql`
  query ListarCandidatos {
    listarCandidatos {
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

export const OBTENER_CANDIDATO = gql`
  query ObtenerCandidato($id: UUID!) {
    obtenerCandidato(id: $id) {
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

// ── OFERTA ───────────────────────────────────────────────────

export const LISTAR_OFERTAS = gql`
  query ListarOfertas {
    listarOfertas {
      id
      titulo
      descripcion
      contrato
      requisitos
      experiencia_tiempo
      modalidad_trabajo
      estado
      sueldo
      cluster_id
      fecha_publicacion
      fecha_vencimiento
      categoria {
        id
        nombre
      }
      reclutador {
        id
        nombre
        apellido
        empresa {
          nombre_comercial
        }
      }
    }
  }
`;

export const OBTENER_OFERTA = gql`
  query ObtenerOferta($id: UUID!) {
    obtenerOferta(id: $id) {
      id
      titulo
      descripcion
      contrato
      requisitos
      experiencia_tiempo
      modalidad_trabajo
      estado
      sueldo
      cluster_id
      fecha_publicacion
      fecha_vencimiento
      categoria {
        id
        nombre
      }
      reclutador {
        id
        nombre
        apellido
        empresa {
          nombre_comercial
        }
      }
    }
  }
`;

// ── POSTULACION ──────────────────────────────────────────────

export const LISTAR_POSTULACIONES = gql`
  query ListarPostulaciones {
    listarPostulaciones {
      id
      fecha
      fase_alcanzada
      id_cv
      candidato {
        id
        nombre
        apellido
        email
        sueldo_esperado
        modalidad_preferida
        nivel_educativo
        nacionalidad
      }
      oferta {
        id
        titulo
        sueldo
        reclutador {
          id
          nombre
          apellido
          empresa {
            nombre_comercial
          }
        }
      }
    }
  }
`;

export const OBTENER_POSTULACION = gql`
  query ObtenerPostulacion($id: UUID!) {
    obtenerPostulacion(id: $id) {
      id
      fecha
      fase_alcanzada
      id_cv
      candidato {
        id
        nombre
        apellido
        email
      }
      oferta {
        id
        titulo
        sueldo
        reclutador {
          nombre
          apellido
          empresa {
            nombre_comercial
          }
        }
      }
    }
  }
`;

// ── CATEGORIA ────────────────────────────────────────────────

export const LISTAR_CATEGORIAS = gql`
  query ListarCategorias {
    listarCategorias {
      id
      nombre
    }
  }
`;

export const OBTENER_CATEGORIA = gql`
  query ObtenerCategoria($id: UUID!) {
    obtenerCategoria(id: $id) {
      id
      nombre
    }
  }
`;

// ── TRABAJOS ─────────────────────────────────────────────────

export const LISTAR_TRABAJOS = gql`
  query ListarTrabajos {
    listarTrabajos {
      id
      nombre
      codigo
    }
  }
`;

export const OBTENER_TRABAJO = gql`
  query ObtenerTrabajo($id: UUID!) {
    obtenerTrabajo(id: $id) {
      id
      nombre
      codigo
    }
  }
`;

// ── HABILIDADES ──────────────────────────────────────────────

export const LISTAR_HABILIDADES = gql`
  query ListarHabilidades {
    listarHabilidades {
      id
      nombre
    }
  }
`;

export const OBTENER_HABILIDAD = gql`
  query ObtenerHabilidad($id: UUID!) {
    obtenerHabilidad(id: $id) {
      id
      nombre
    }
  }
`;

// ── RELACIONES ───────────────────────────────────────────────

export const LISTAR_CANDIDATO_HABILIDADES = gql`
  query ListarCandidatoHabilidades {
    listarCandidatoHabilidades {
      id
      candidato {
        id
        nombre
        apellido
      }
      habilidad {
        id
        nombre
      }
    }
  }
`;

export const LISTAR_OFERTA_HABILIDADES = gql`
  query ListarOfertaHabilidades {
    listarOfertaHabilidades {
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

export const LISTAR_OFERTA_TRABAJOS = gql`
  query ListarOfertaTrabajos {
    listarOfertaTrabajos {
      id
      oferta {
        id
        titulo
      }
      trabajos {
        id
        nombre
        codigo
      }
    }
  }
`;
