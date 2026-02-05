# Google Workspace MCP Server

Este servidor MCP proporciona acceso a Google Classroom, Calendar y Gmail utilizando una cuenta de servicio.

## Configuración

El archivo `service-account.json` contiene las credenciales de la cuenta de servicio.

**Importante:** Para que funcione, debes compartir tus calendarios, carpetas de Drive o invitar al correo de servicio (`panxo-984@panxo-assistant.iam.gserviceaccount.com`) a tus clases de Classroom como profesor o alumno.

## Herramientas Disponibles

- `list_courses`: Lista los cursos de Classroom.
- `create_announcement`: Publica un anuncio en un curso.
- `list_calendar_events`: Lista eventos del calendario.
- `send_email`: Envía un correo electrónico.
