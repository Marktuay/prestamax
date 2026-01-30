# Excel to WooCommerce Product Importer Converter

Esta herramienta convierte archivos Excel con información de inventario al formato de importación de productos de WooCommerce.

## Requisitos

- Node.js 16+ 
- Dependencias del proyecto instaladas (`npm install` en la carpeta `prestamax-backend`)

## Instalación

```bash
cd prestamax-backend
npm install
```

## Uso

### Opción 1: Usando npm script (recomendado)

```bash
npm run convert-excel -- --input tu_inventario.xlsx --output productos_woocommerce.csv
```

### Opción 2: Ejecutando el script directamente

```bash
node scripts/excel_to_woocommerce.js --input tu_inventario.xlsx --output productos_woocommerce.csv
```

## Parámetros

- `--input, -i`: Ruta al archivo Excel de entrada (requerido)
- `--output, -o`: Ruta al archivo CSV de salida (por defecto: woocommerce_products.csv)
- `--help, -h`: Muestra la ayuda

## Ejemplos

### Conversión básica
```bash
npm run convert-excel -- -i inventario.xlsx -o productos.csv
```

### Usando valores por defecto para el archivo de salida
```bash
npm run convert-excel -- -i inventario.xlsx
```

### Ver ayuda
```bash
npm run convert-excel -- --help
```

## Mapeo de Campos

El script mapea automáticamente campos comunes de inventario a los campos de WooCommerce:

| Campo de Inventario (Excel) | Campo WooCommerce |
|------------------------------|-------------------|
| SKU, Código | SKU |
| Nombre, Name, Producto | Name |
| Descripción, Description | Description |
| Descripción Corta, Short Description | Short description |
| Precio, Price, Precio Regular | Regular price |
| Precio Venta, Sale Price | Sale price |
| Stock, Cantidad, Quantity, Inventario | Stock |
| Categoría, Category, Categorías | Categories |
| Marca, Brand | Brands |
| Peso, Weight | Weight (kg) |
| Ancho, Width | Width (cm) |
| Alto, Height | Height (cm) |
| Largo, Length | Length (cm) |
| Imagen, Image, Imágenes | Images |
| Etiquetas, Tags | Tags |
| EAN, UPC, GTIN, ISBN | GTIN, UPC, EAN, or ISBN |

## Valores por Defecto

El script establece automáticamente los siguientes valores para los productos:

- **Type**: simple
- **Published**: 1 (sí, publicado)
- **Visibility in catalog**: visible
- **Tax status**: taxable
- **Allow customer reviews?**: 1 (sí)
- **In stock?**: Se determina automáticamente según el stock (1 si stock > 0, 0 si stock = 0)

## Formato del Archivo Excel de Entrada

El archivo Excel debe tener:
- Una hoja de cálculo con datos (se usará la primera hoja)
- Primera fila con nombres de columnas/campos
- Filas subsecuentes con los datos de productos

### Ejemplo de estructura Excel:

| SKU | Nombre | Descripción | Precio | Stock | Categoría | Marca |
|-----|--------|-------------|--------|-------|-----------|-------|
| PROD001 | Laptop HP | Laptop con 8GB RAM | 899.99 | 15 | Electrónica | HP |
| PROD002 | Mouse Logitech | Mouse ergonómico | 99.99 | 50 | Accesorios | Logitech |

## Formato de Salida

El script genera un archivo CSV con todos los campos requeridos por WooCommerce, incluyendo:

- Información básica del producto (ID, Type, SKU, Name)
- Descripción (corta y completa)
- Precios (regular y de venta)
- Stock y disponibilidad
- Dimensiones y peso
- Categorías, tags y marca
- Atributos del producto
- Meta campos de WooCommerce
- Y muchos más (85+ campos en total)

## Importar a WooCommerce

Una vez generado el archivo CSV:

1. Inicia sesión en tu panel de administración de WordPress/WooCommerce
2. Ve a **Productos > Importar**
3. Selecciona el archivo CSV generado
4. Sigue el asistente de importación de WooCommerce
5. Revisa y ajusta el mapeo de campos si es necesario
6. Completa la importación

## Formateo de Precios

El script limpia automáticamente los precios:
- Elimina símbolos de moneda ($, €, etc.)
- Convierte comas a puntos decimales
- Mantiene solo números y punto decimal

**Ejemplos:**
- `$899,99` → `899.99`
- `€1.250,50` → `1250.50`
- `750` → `750`

## Formateo de Estado de Stock

El campo "In stock?" se establece automáticamente:
- Si Stock > 0: **In stock? = 1** (En stock)
- Si Stock = 0 o vacío: **In stock? = 0** (Agotado)

## Solución de Problemas

### Error: Input file not found
- Verifica que la ruta del archivo Excel sea correcta
- Usa rutas absolutas o relativas correctamente

### Error: No data found in Excel file
- Asegúrate de que el archivo Excel tenga datos en la primera hoja
- Verifica que la primera fila contenga los nombres de las columnas

### Campos no se mapean correctamente
- Revisa los nombres de las columnas en tu Excel
- Los nombres de columnas no distinguen mayúsculas/minúsculas
- Puedes modificar el mapeo en el archivo `excel_to_woocommerce.js` editando `DEFAULT_FIELD_MAPPING`

## Personalización

Si necesitas agregar más mapeos de campos, edita el archivo `scripts/excel_to_woocommerce.js` y modifica el objeto `DEFAULT_FIELD_MAPPING`:

```javascript
const DEFAULT_FIELD_MAPPING = {
  'tu_campo_excel': 'Campo WooCommerce',
  // ... más mapeos
};
```

## Notas Importantes

- El script procesa la **primera hoja** del archivo Excel
- Los nombres de los campos no distinguen entre mayúsculas y minúsculas
- Los espacios en los nombres de campos se normalizan
- Todos los campos de WooCommerce se incluyen en la salida, aunque estén vacíos

## Soporte

Para problemas o preguntas:
- Revisa los logs de la consola durante la conversión
- Verifica el archivo de salida CSV con un editor de texto
- Contacta al equipo de desarrollo

## Archivo de Ejemplo

Se incluye un archivo de ejemplo `sample_inventory.xlsx` en la carpeta `prestamax-backend` para probar la herramienta.

Para probar con el archivo de ejemplo:
```bash
npm run convert-excel -- -i sample_inventory.xlsx -o test_output.csv
```

---

**Autor:** Ing. Marcelo Martinez Vallecillo  
**Email:** marktuay@gmail.com  
**Fecha:** Enero 2026
