export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-400 mb-10">Última actualización: 1 de septiembre de 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Compromiso con su privacidad</h2>
            <p>En ColmadoApp, su privacidad es fundamental. Esta política describe cómo recopilamos, usamos, protegemos y compartimos su información personal cuando utiliza nuestra plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Datos que recopilamos</h2>
            <p><strong>Datos de cuenta:</strong></p>
            <ul className="mt-2 ml-6 space-y-1">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Contraseña (almacenada de forma encriptada)</li>
            </ul>
            <p className="mt-3"><strong>Datos de uso del servicio:</strong></p>
            <ul className="mt-2 ml-6 space-y-1">
              <li>Productos registrados en inventario</li>
              <li>Historial de ventas y transacciones</li>
              <li>Información de créditos y cobros</li>
              <li>Datos de clientes registrados</li>
            </ul>
            <p className="mt-3"><strong>Datos técnicos:</strong></p>
            <ul className="mt-2 ml-6 space-y-1">
              <li>Dirección IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Páginas visitadas dentro del sistema</li>
              <li>Fecha y hora de acceso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Cómo usamos sus datos</h2>
            <p>Utilizamos su información exclusivamente para:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li>Proveer y mantener el servicio de ColmadoApp</li>
              <li>Procesar sus transacciones y pagos</li>
              <li>Enviar notificaciones importantes sobre su cuenta</li>
              <li>Mejorar la experiencia del usuario</li>
              <li>Generar reportes y estadísticas agregadas (sin identificarle personalmente)</li>
              <li>Prevenir fraudes y abusos del sistema</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. No vendemos sus datos</h2>
            <p><strong>Nunca venderemos, alquilaremos ni compartiremos</strong> su información personal con terceros para fines de marketing o publicidad.</p>
            <p className="mt-3">Únicamente compartimos datos con:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li><strong>Supabase:</strong> Proveedor de infraestructura que almacena los datos de forma segura</li>
              <li><strong>Vercel:</strong> Proveedor de hosting que distribuye la aplicación</li>
            </ul>
            <p className="mt-3">Estos proveedores actúan como encargados del tratamiento y están obligados a proteger su información bajo acuerdos contractuales estrictos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Seguridad de los datos</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li>Contraseñas encriptadas con bcrypt</li>
              <li>Conexiones cifradas (HTTPS/TLS)</li>
              <li>Autenticación por tokens JWT</li>
              <li>Políticas de acceso por usuario (RLS)</li>
              <li>Respaldo automático de datos</li>
            </ul>
            <p className="mt-3">Sin embargo, ningún sistema es 100% seguro. Le recomendamos utilizar contraseñas fuertes y no compartirlas con nadie.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Sus derechos</h2>
            <p>Usted tiene derecho a:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li><strong>Acceso:</strong> Solicitar una copia de todos sus datos personales</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación permanente de sus datos</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
            </ul>
            <p className="mt-3">Para ejercer estos derechos, envíe un correo a <strong>williamsjph120@gmail.com</strong>. Responderemos dentro de los 15 días hábiles siguientes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Retención de datos</h2>
            <p>Mantendemos sus datos mientras su cuenta esté activa. Tras la cancelación:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li>Datos de cuenta: eliminados 30 días después de la cancelación</li>
              <li>Datos de uso (ventas, productos): eliminados 30 días después de la cancelación</li>
              <li>Registros de facturación: retenidos 5 años por obligación fiscal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cookies</h2>
            <p>ColmadoApp utiliza cookies para:</p>
            <ul className="mt-3 ml-6 space-y-1">
              <li><strong>Cookies de sesión:</strong> Necesarias para mantener su sesión activa</li>
              <li><strong>Cookies de preferencias:</strong> Recordar configuraciones del usuario</li>
            </ul>
            <p className="mt-3">No utilizamos cookies de publicidad o rastreo de terceros. Puede gestionar las cookies desde la configuración de su navegador.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Menores de edad</h2>
            <p>ColmadoApp no está dirigido a menores de 18 años. No recopilamos intencionalmente información de menores. Si nos enteramos de que un menor ha proporcionado datos personales, los eliminaremos de inmediato.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Cambios en esta política</h2>
            <p>Podemos actualizar esta Política de Privacidad en cualquier momento. Los cambios serán publicados en esta página con la fecha de última actualización. Le notificaremos por correo electrónico si los cambios son significativos.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Legislación aplicable</h2>
            <p>Esta Política de Privacidad se rige por la Ley General de Protección de Datos Personales N° 172-13 y demás normativa aplicable de la República Dominicana.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contacto</h2>
            <p>Para consultas sobre privacidad y protección de datos: <strong>williamsjph120@gmail.com</strong></p>
          </section>
        </div>
      </div>
    </div>
  );
}
