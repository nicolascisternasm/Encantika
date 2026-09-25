-- Agrega columna de características como JSON en productos
-- Formato: [{"nombre": "Material", "valor": "Plata 925"}, ...]
ALTER TABLE productos ADD COLUMN IF NOT EXISTS caracteristicas jsonb DEFAULT '[]';
