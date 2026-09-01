export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Cookies</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: 1 de septiembre de 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. ¿Qué son las cookies?</h2>
            <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (computadora, tablet o teléfono) cuando visita un sitio web. Permiten que el sitio recuerde sus acciones y preferencias durante un período de tiempo.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Cookies que utilizamos</h2>
            <p>ColmadoApp utiliza únicamente las siguientes cookies:</p>
            <ul className="mt-3 ml-6 space-y-3">
              <li>
                <strong>Cookie de sesión (sb-qyiejhkqyvjoakbucypn-auth-token)</strong>
                <p className="text-sm text-gray-500 mt-1">Necesaria para mantener su sesión de usuario activa. Se elimina automáticamente al cerrar el navegador. Sin esta cookie, no podría iniciar sesión en el sistema.</p>
              </li>
              <li>
                <strong>Cookie de preferencias</strong>
                <p className="text-sm text-gray-500 mt-1">Almacena configuraciones básicas como el idioma y el tema de visualización.</p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cookies que NO utilizamos</h2>
            <ul className="mt-3 ml-6 space-y-1">
              <li>Cookies de publicidad o publicidad dirigida</li>
              <li>Cookies de rastreo entre sitios web</li>
              <li>Cookies de redes sociales</li>
              <li>Cookies de análisis de terceros (Google Analytics, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Base legal para el uso de cookies</h2>
            <p>Las cookies que utilizamos son <strong>estrictamente necesarias</strong> para el funcionamiento del servicio. Su uso se basa en nuestro interés legítimo de proveer un servicio funcional y seguro.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Gestión de cookies desde el navegador</h2>
            <p>Puede configurar su navegador para bloquear o eliminar cookies. Sin embargo, si bloquea las cookies de sesión, <strong>no podrá iniciar sesión</strong> en ColmadoApp.</p>
            <p className="mt-3">Instrucciones según su navegador:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
              <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
              <li><strong>Safari:</strong> Preferencias → Privacidad → Administrar cookies</li>
              <li><strong>Edge:</strong> Configuración → Privacidad → Cookies y permisos de sitio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies de terceros</h2>
            <p>ColmadoApp no utiliza cookies de terceros. Sin embargo, nuestros proveedores de infraestructura (Supabase, Vercel) pueden utilizar cookies técnicas para el funcionamiento del servicio. Estas cookies son gestionadas directamente por dichos proveedores.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Actualizaciones de esta política</h2>
            <p>Podemos actualizar esta Política de Cookies para reflejar cambios en las cookies que utilizamos o por otras razones operativas. Le recomendamos revisar esta página periódicamente.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contacto</h2>
            <p>Si tiene preguntas sobre el uso de cookies: <strong>williamsjph120@gmail.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
}
