# Trabaja-con-nosotros
La documentación del backend se encuentra en la carpeta Documentation.

Este código debe ejecutarse en un entorno NODE.js (versión utilizada durante el desarrollo: 14.17.1).
La carpeta /public debe ser hosteada por un servidor hosting (el entorno NODE no está configurado para que se hostee automáticamente. Puedes utilizar un servidor distinto al del entrono NODE o ajustarlo para permitir el hosting en el mismo (tanto con NODE como con otro servicio como Apache, http-server, etc).

Para facilitar la implementación en el cliente, en la carpeta public se encuentra un panel de administración y un sistema de login.

Si deseas crear un usuario debes dirigirte a la carpeta functions/auth/users y crear un fichero nuevo. El nombre del fichero será el UID (User ID). No debe contener carácteres especiales ni espacios, lo recomendable es que sea un número único sin espacios. La extensión debe ser .json. Ejemplo: 333.json.

El fichero contiene la configuración del usuario. Puedes seguir la siguiente plantilla para ajustarlo:
{
"uid":"333",
"name":"Usuario de ejmplo",
"login":"ejemplo",
"admin":false,
"lastLogin":0,
"canLogin":true,
"password":"5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
}

En este ejemplo se puede iniciar sesión con el usuario "ejemplo" y la contraseña "password". La contraseña en el fichero de usuario debe estar hasheada utilizando SHA-256.
Es importante que el campo "uid" sea igual al nombre del fichero sin la extensión. El resto de campos pueden dejarse tal y como están en el ejemplo.

Cualquier consulta sobre la implementación del servicio consulta la documentación.
