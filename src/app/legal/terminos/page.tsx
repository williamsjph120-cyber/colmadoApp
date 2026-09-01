export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: 1 de septiembre de 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceptación de los términos</h2>
            <p>Al acceder y utilizar ColmadoApp, usted acepta estos Términos de Uso en su totalidad. Si no está de acuerdo con alguno de estos términos, no debe utilizar el servicio.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Descripción del servicio</h2>
            <p>ColmadoApp es una plataforma en línea que ofrece herramientas de gestión para colmados y pequeños comercios, incluyendo:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li>Punto de venta digital</li>
              <li>Control de inventario</li>
              <li>Gestión de créditos y cobros</li>
              <li>Reportes de ventas y ganancias</li>
              <li>Historial de transacciones</li>
              <li>Panel de administración</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cuentas de usuario</h2>
            <p>Para utilizar ColmadoApp, usted debe crear una cuenta con información verdadera y completa. Usted es responsable de:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li>Mantener la confidencialidad de sus credenciales de acceso</li>
              <li>Todas las actividades que ocurran bajo su cuenta</li>
              <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
            </ul>
            <p className="mt-3">Una cuenta es personal e intransferible. No está permitido compartir credenciales con terceros ni crear múltiples cuentas para el mismo negocio.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Planes de pago y facturación</h2>
            <p>ColmadoApp ofrece los siguientes planes de suscripción mensual:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li><strong>Básico:</strong> RD$500/mes</li>
              <li><strong>Estándar:</strong> RD$800/mes</li>
              <li><strong>Premium:</strong> RD$1,200/mes</li>
            </ul>
            <p className="mt-3">El pago se realiza por adelantado para el mes en curso. Los precios están en pesos dominicanos (RD$) e incluyen todos los impuestos aplicables.</p>
            <p className="mt-3">Todos los usuarios cuentan con un período de prueba gratuito de 30 días al registrarse, durante el cual tendrán acceso al plan Básico.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cancelación y reembolsos</h2>
            <p>Puede cancelar su suscripción en cualquier momento desde la sección de Plan en su cuenta. La cancelación será efectiva al final del período facturado.</p>
            <p className="mt-3"><strong>No se realizan reembolsos</strong> por meses ya facturados, incluyendo el período de prueba gratuito. Al cancelar, su acceso se mantendrá hasta que termine el período pagado.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Uso aceptable</h2>
            <p>Usted se compromete a utilizar ColmadoApp de manera lícita y conforme a estos términos. Queda expresamente prohibido:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li>Utilizar el servicio para fines ilegales o no autorizados</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Interferir con el funcionamiento del servicio</li>
              <li>Realizar ingeniería inversa del código fuente</li>
              <li>Utilizar el servicio para transmitir malware o contenido dañino</li>
              <li>Explotar errores o fallas del sistema en beneficio propio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Propiedad intelectual</h2>
            <p>ColmadoApp y todo su contenido, incluyendo código, diseño, textos, gráficos y logotipos, son propiedad de Williams Perdomo y están protegidos por las leyes de propiedad intelectual de la República Dominicana y tratados internacionales.</p>
            <p className="mt-3">Usted conserva la propiedad de los datos que ingresa al sistema (productos, ventas, clientes). No reclamos derechos sobre dichos datos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Disponibilidad del servicio</h2>
            <p>Nos esforzamos por mantener ColmadoApp disponible 24/7, pero no garantizamos disponibilidad ininterrumpida. Nos reservamos el derecho de realizar mantenimientos programados o suspender el servicio temporalmente sin previo aviso.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Limitación de responsabilidad</h2>
            <p>ColmadoApp se ofrece &quot;tal cual&quot;. No garantizamos que el servicio será ininterrumpido, seguro o libre de errores. En ningún caso seremos responsables por:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li>Pérdida de datos por fallos técnicos</li>
              <li>Daños indirectos, incidentales o consecuentes</li>
              <li>Pérdidas económicas derivadas del uso del servicio</li>
              <li>Decisiones tomadas basándose en la información del sistema</li>
            </ul>
            <p className="mt-3">Le recomendamos realizar copias de seguridad periódicas de sus datos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Suspensión y terminación</h2>
            <p>Nos reservamos el derecho de suspender o terminar su cuenta si detectamos:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li>Violación de estos términos de uso</li>
              <li>Uso fraudulento o sospechoso</li>
              <li>Falta de pago después del período de gracia</li>
              <li>Solicitud del usuario</li>
            </ul>
            <p className="mt-3">Tras la terminación, sus datos se mantendrán por 30 días y luego serán eliminados permanentemente.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página y le notificaremos por correo electrónico con al menos 15 días de anticipación.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Legislación aplicable</h2>
            <p>Estos Términos de Uso se rigen por las leyes de la República Dominicana. Cualquier disputa será resuelta ante los tribunales competentes de Santo Domingo, República Dominicana.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contacto</h2>
            <p>Para consultas sobre estos términos: <strong>williamsjph120@gmail.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
}
