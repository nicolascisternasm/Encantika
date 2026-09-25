-- Fase 3B: Sistema de temas y fuentes en configuracion_tienda

ALTER TABLE configuracion_tienda
  ADD COLUMN tema text NOT NULL DEFAULT 'dorado_clasico'
    CHECK (tema IN ('dorado_clasico', 'plata_moderno', 'rosa_nude', 'oscuro_elegante', 'blanco_minimal')),
  ADD COLUMN fuente_titulos text NOT NULL DEFAULT 'cormorant'
    CHECK (fuente_titulos IN ('cormorant', 'great_vibes', 'pinyon_script', 'sacramento', 'tangerine', 'alex_brush'));
