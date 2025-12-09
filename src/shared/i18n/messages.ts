export const messages = {
  es: {
    login_title: 'Acceso al sistema',
    login_button: 'Ingresar',
    login_username_label: 'Usuario',
    login_password_label: 'Contraseña',
    login_help: 'Si no tienes usuario, solicita tu registro a un funcionario de la entidad.',
    prestatarios_title: 'Prestatarios',
    prestatarios_empty: 'No hay prestatarios registrados.',
    prestamos_title: 'Préstamos y solicitudes',
    prestamos_new_button: 'Solicitar nuevo préstamo'
  }
} as const;

export type Locale = keyof typeof messages;
export type MessageKey = keyof (typeof messages)['es'];
