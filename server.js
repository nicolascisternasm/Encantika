// Fuerza 0.0.0.0 explícitamente antes de delegar al server.js del standalone.
// El standalone ya lee PORT y HOSTNAME del entorno; esto elimina ambigüedad.
process.env.HOSTNAME = '0.0.0.0'
require('./.next/standalone/server.js')
