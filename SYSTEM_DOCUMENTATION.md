
# SoftwarePar - Documentación del Sistema

## Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Autenticación y Autorización](#autenticación-y-autorización)
5. [Módulos del Sistema](#módulos-del-sistema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Integraciones](#integraciones)
9. [Configuración y Despliegue](#configuración-y-despliegue)
10. [Seguridad](#seguridad)
11. [Mantenimiento](#mantenimiento)

## Resumen Ejecutivo

SoftwarePar es una plataforma web profesional diseñada para la empresa SoftwarePar.Lat que facilita la gestión de proyectos de desarrollo de software, programa de partners, y operaciones comerciales. El sistema maneja tres tipos de usuarios principales: clientes, partners y administradores.

### Características Principales
- **Sistema multi-rol** con dashboards específicos para cada tipo de usuario
- **Programa de partners** con códigos de referencia y comisiones
- **Gestión de proyectos** con seguimiento de progreso y estados
- **Sistema de tickets** para soporte técnico
- **Integración con MercadoPago** para procesamiento de pagos
- **Sistema de notificaciones** en tiempo real con WebSockets
- **Portfolio dinámico** administrable desde el panel de control
- **Landing page** responsive con formulario de contacto

## Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
- **React 18.3.1** con TypeScript
- **Vite 5.4.19** como bundler y dev server
- **TailwindCSS 3.4.17** para estilos
- **shadcn/ui** componentes de UI
- **TanStack Query 5.60.5** para gestión de estado del servidor
- **Wouter 3.3.5** para routing
- **React Hook Form 7.55.0** con validación Zod
- **Framer Motion** para animaciones

#### Backend
- **Node.js** con Express.js
- **TypeScript** para type safety
- **Drizzle ORM** para gestión de base de datos
- **PostgreSQL** como base de datos principal
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **WebSockets** para notificaciones en tiempo real
- **Nodemailer** para envío de emails

#### Base de Datos
- **PostgreSQL** en Neon (conexión configurada)
- **Drizzle ORM** con migraciones automáticas
- **Esquema relacional** bien definido

### Estructura del Proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Páginas principales
│   │   ├── lib/           # Utilidades y configuración
│   │   └── types/         # Definiciones TypeScript
├── server/                # Backend Express
│   ├── auth.ts           # Autenticación y autorización
│   ├── routes.ts         # Definición de rutas API
│   ├── storage.ts        # Capa de acceso a datos
│   ├── email.ts          # Servicio de emails
│   └── mercadopago.ts    # Integración de pagos
├── shared/               # Código compartido
│   └── schema.ts         # Esquemas de base de datos y validación
```

## Base de Datos

### Conexión
- **URL**: `postgresql://neondb_owner:npg_rMEA06LeCXTp@ep-lingering-flower-acgio13c-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- **Provider**: Neon PostgreSQL
- **ORM**: Drizzle

### Esquema de Tablas

#### `users` - Usuarios del sistema
```sql
- id: serial PRIMARY KEY
- email: varchar(255) UNIQUE NOT NULL
- password: varchar(255) NOT NULL
- fullName: varchar(255) NOT NULL
- role: varchar(50) DEFAULT 'client' ('admin', 'client', 'partner')
- isActive: boolean DEFAULT true
- createdAt: timestamp DEFAULT NOW()
- updatedAt: timestamp DEFAULT NOW()
```

#### `partners` - Información de partners
```sql
- id: serial PRIMARY KEY
- userId: integer REFERENCES users(id)
- referralCode: varchar(50) UNIQUE NOT NULL
- commissionRate: decimal(5,2) DEFAULT 25.00
- totalEarnings: decimal(12,2) DEFAULT 0.00
- createdAt: timestamp DEFAULT NOW()
```

#### `projects` - Proyectos de desarrollo
```sql
- id: serial PRIMARY KEY
- name: varchar(255) NOT NULL
- description: text
- price: decimal(12,2) NOT NULL
- status: varchar(50) DEFAULT 'pending'
- progress: integer DEFAULT 0
- clientId: integer REFERENCES users(id)
- partnerId: integer REFERENCES partners(id)
- deliveryDate: timestamp
- createdAt: timestamp DEFAULT NOW()
- updatedAt: timestamp DEFAULT NOW()
```

#### `portfolio` - Portfolio de trabajos
```sql
- id: serial PRIMARY KEY
- title: varchar(255) NOT NULL
- description: text NOT NULL
- category: varchar(100) NOT NULL
- technologies: text NOT NULL
- imageUrl: text NOT NULL
- demoUrl: text
- completedAt: timestamp NOT NULL
- featured: boolean DEFAULT false
- isActive: boolean DEFAULT true
- createdAt: timestamp DEFAULT NOW()
- updatedAt: timestamp DEFAULT NOW()
```

#### Otras tablas
- `referrals` - Gestión de referencias
- `tickets` - Sistema de soporte
- `payments` - Registro de pagos
- `notifications` - Notificaciones del sistema
- `sessions` - Gestión de sesiones

## Autenticación y Autorización

### Sistema de Autenticación
- **JWT Tokens** con expiración de 7 días
- **bcryptjs** para hash de contraseñas (salt rounds: 10)
- **Middleware de autenticación** para rutas protegidas
- **Verificación de roles** para autorización granular

### Roles del Sistema
1. **admin**: Acceso completo al sistema
2. **client**: Acceso a proyectos propios y funciones de cliente
3. **partner**: Acceso a dashboard de partner y gestión de referidos

### Middleware de Seguridad
```typescript
// Autenticación requerida
app.use("/api/protected", authenticateToken);

// Autorización por roles
app.use("/api/admin", requireRole(["admin"]));
app.use("/api/partners", requireRole(["partner", "admin"]));
```

## Módulos del Sistema

### 1. Landing Page
- **Componente**: `Landing.tsx`
- **Funcionalidades**:
  - Hero section con llamada a la acción
  - Sección de servicios
  - Portfolio dinámico (últimos trabajos)
  - Estadísticas de la empresa
  - Formulario de contacto
  - Footer con información de contacto

### 2. Sistema de Autenticación
- **Modal de autenticación** con login/registro
- **Validación de formularios** con Zod
- **Gestión de estado** con TanStack Query
- **Redirección automática** según el rol del usuario

### 3. Dashboard de Cliente
- **Vista de proyectos** propios
- **Seguimiento de progreso**
- **Creación de tickets** de soporte
- **Gestión de notificaciones**

### 4. Dashboard de Partner
- **Estadísticas de ganancias**
- **Gestión de referidos**
- **Código de referencia** único
- **Tracking de comisiones**

### 5. Dashboard de Administrador
- **Gestión de usuarios**
- **Administración de proyectos**
- **Configuración de MercadoPago**
- **Gestión del portfolio**
- **Estadísticas del sistema**

### 6. Sistema de Tickets
- **Creación de tickets** de soporte
- **Estados**: open, in_progress, resolved, closed
- **Prioridades**: low, medium, high, urgent
- **Asignación a proyectos**

### 7. Sistema de Pagos
- **Integración con MercadoPago**
- **Webhooks** para confirmación de pagos
- **Estados de pago**: pending, completed, failed
- **Tracking de transacciones**

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/register` - Registro de usuario
- `GET /api/auth/me` - Información del usuario actual

### Usuarios
- `GET /api/users` - Lista de usuarios (admin)
- `PUT /api/users/:id` - Actualizar usuario (admin)

### Partners
- `GET /api/partners/me` - Información del partner actual
- `GET /api/partners/referrals` - Lista de referidos
- `POST /api/partners` - Crear partner (admin)

### Proyectos
- `GET /api/projects` - Lista de proyectos
- `POST /api/projects` - Crear proyecto
- `PUT /api/projects/:id` - Actualizar proyecto

### Portfolio
- `GET /api/portfolio` - Lista pública del portfolio
- `POST /api/portfolio` - Crear entrada (admin)
- `PUT /api/portfolio/:id` - Actualizar entrada (admin)
- `DELETE /api/portfolio/:id` - Eliminar entrada (admin)

### Tickets
- `GET /api/tickets` - Lista de tickets
- `POST /api/tickets` - Crear ticket
- `PUT /api/tickets/:id` - Actualizar ticket

### Pagos
- `POST /api/payments/create` - Crear pago
- `POST /api/payments/webhook` - Webhook de MercadoPago

### Notificaciones
- `GET /api/notifications` - Lista de notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída

### Contacto
- `POST /api/contact` - Enviar formulario de contacto

## Frontend Components

### Componentes de UI (shadcn/ui)
- **Button, Card, Dialog, Form, Input, Select, etc.**
- **Componentes customizados** para el diseño específico
- **Temas consistent** con variables CSS

### Componentes Principales
- `Layout.tsx` - Layout principal con navegación
- `DashboardLayout.tsx` - Layout para dashboards
- `AuthModal.tsx` - Modal de autenticación
- `ContactForm.tsx` - Formulario de contacto
- `Sidebar.tsx` - Navegación lateral
- `UserMenu.tsx` - Menú de usuario

### Custom Hooks
- `useAuth.ts` - Gestión de autenticación
- `useProjects.ts` - Gestión de proyectos
- `usePartner.ts` - Gestión de partner
- `useAdmin.ts` - Funciones de administrador
- `useWebSocket.ts` - Conexión WebSocket

## Integraciones

### 1. MercadoPago
- **API de pagos** para procesamiento
- **Webhooks** para confirmación automática
- **Configuración dinámica** desde el admin panel
- **Sandbox/Production** environments

### 2. Email (Nodemailer + Gmail)
- **Emails de bienvenida** para nuevos usuarios
- **Notificaciones de contacto** para administradores
- **Notificaciones de comisiones** para partners
- **Configuración SMTP** con Gmail

### 3. WebSockets
- **Notificaciones en tiempo real**
- **Estados de conexión**
- **Mensajes de bienvenida**
- **Echo para testing**

### 4. PostgreSQL (Neon)
- **Base de datos en la nube**
- **SSL/TLS encryption**
- **Connection pooling**
- **Backup automático**

## Configuración y Despliegue

### Variables de Entorno
```env
# Base de datos
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email
GMAIL_USER=jhonidelacruz89@gmail.com
GMAIL_PASS=htzmerglesqpdoht

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_access_token
MERCADOPAGO_PUBLIC_KEY=your_public_key
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret

# Puerto
PORT=5000
```

### Scripts de Desarrollo
```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "npm run build:client && npm run build:server",
  "start": "NODE_ENV=production node dist/server/index.js"
}
```

### Configuración de Replit
- **Puerto**: 5000 (configurado para forwarding automático)
- **Comando de inicio**: `npm run dev`
- **Hot reload** habilitado para desarrollo
- **Auto-instalación** de dependencias

## Seguridad

### Medidas Implementadas
1. **Hash de contraseñas** con bcryptjs
2. **JWT tokens** con expiración
3. **Validación de entrada** con Zod schemas
4. **Sanitización** de datos
5. **CORS** configurado apropiadamente
6. **HTTPS** en producción
7. **Validación de roles** en endpoints
8. **Rate limiting** (recomendado implementar)

### Vulnerabilidades a Considerar
- **SQL Injection**: Mitigado con Drizzle ORM
- **XSS**: Sanitización en frontend
- **CSRF**: Tokens JWT stateless
- **Session hijacking**: HTTPS + secure cookies

## Mantenimiento

### Logs del Sistema
- **Express logging** con timestamps
- **Error handling** centralizado
- **WebSocket connection** tracking
- **Database query** logging (desarrollo)

### Backup y Recuperación
- **Base de datos**: Backup automático en Neon
- **Código**: Versionado en Git
- **Assets**: Recomendado CDN para producción

### Monitoreo
- **Health checks** en endpoints
- **Performance monitoring** recomendado
- **Error tracking** (Sentry recomendado)
- **Uptime monitoring**

### Actualizaciones
- **Dependencias**: Revisar mensualmente
- **Seguridad**: Patches inmediatos
- **Features**: Versionado semántico
- **Migraciones**: Scripts automáticos con Drizzle

## Conclusiones

SoftwarePar es un sistema robusto y escalable que cumple con los requerimientos de una empresa de desarrollo de software moderna. La arquitectura permite:

- **Escalabilidad horizontal** con la separación frontend/backend
- **Mantenibilidad** con TypeScript y arquitectura modular
- **Seguridad** con las mejores prácticas implementadas
- **Experiencia de usuario** optimizada con React y UI moderna
- **Operaciones comerciales** eficientes con el sistema de partners y pagos

El sistema está preparado para crecimiento futuro y nuevas funcionalidades.
