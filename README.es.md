# Por Qué Comparto Esto

Mientras buscaba recursos para construir aplicaciones con IA rápidamente—principalmente usando el AI SDK de Vercel encontré toneladas de tutoriales en video en YouTube, además de excelente documentación oficial. Eso me hizo pensar: esta es una forma perfecta de introducir a las personas a lo que podría sentirse como un espacio intimidante.

Mi idea era simple: construir tantas funciones pequeñas de IA como fuera posible para ver qué es factible, cuánto tiempo toma, y cuánto código se requiere realmente para demos funcionales. Resulta que puedes lograr _mucho_ con código mínimo y en muy poco tiempo.

Esta no es una aplicación de producción ni nada serio—soy yo experimentando con IA, probando ideas y divirtiéndome con la interfaz. El resultado fue un pequeño proyecto demo: [échale un vistazo aquí](https://ai-sdk-demo-playground.vercel.app/).

## 🔧 Salida Estructurada (Sorprendentemente Práctica)

Esta es probablemente la característica más útil. En lugar de solo recibir texto aleatorio de una IA, puedes pedirle que devuelva datos estructurados.

¿Quieres una receta? Obtendrás un título, una lista de ingredientes e instrucciones claras. ¿Necesitas una lista de Pokémon? Obtendrás un array de objetos con nombres, tipos y estadísticas.

Es como trabajar con una IA que realmente _entiende_ lo que le estás pidiendo y formatea la respuesta para que puedas usarla de inmediato.

## 🌐 Herramientas Externas (Donde Ocurre la Magia)

Aquí es donde las cosas se vuelven realmente divertidas. Conecté una API del clima para que puedas preguntar "¿Cómo está el clima en Tokio?"—y la IA obtiene datos reales.

Con búsquedas web y otras APIs, puedes combinar servicios para darle nuevas habilidades a tu IA. Es esencialmente como darle superpoderes a tu aplicación.

## Cómo lo Construí

### El Stack Tecnológico

Bastante estándar hoy en día:

- **Next.js 15**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui**
- **Zod** (clave para validar respuestas estructuradas)
- **Vercel AI SDK v5** (la estrella del show, manejando todo el trabajo de IA)
- **Arcjet** (para seguridad—detección de bots, limitación de velocidad—para que no me arruine por abuso del demo)

---

### La Arquitectura

La configuración es simple. Cada característica tiene su propia ruta API en `app/api/`:

- Chat en una
- Generación de imágenes en otra
- Herramientas en otra

La interfaz sigue el mismo patrón: cada característica tiene su propia página de playground, donde también puedes ver el código mínimo que la impulsa.

El AI SDK hace la mayor parte del trabajo pesado. Por ejemplo:

- `useChat()` maneja las interacciones de chat
- `useCompletion()` cubre la generación de texto

También maneja streaming, estado y más—dejándome sorprendido de cuán poco código se necesitó.

### Por Qué la Salida Estructurada lo Cambia Todo

El texto plano está bien para chat, pero los datos estructurados son mucho más útiles para aplicaciones reales. Por ejemplo:
