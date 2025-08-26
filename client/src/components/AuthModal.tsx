import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLogin, useRegister } from "@/hooks/useAuth";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@shared/schema";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
}

export default function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const { toast } = useToast();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "client",
    },
  });

  const onLoginSubmit = async (data: LoginInput) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de vuelta",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error en el login",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    }
  };

  const onRegisterSubmit = async (data: RegisterInput) => {
    try {
      await registerMutation.mutateAsync(data);
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada exitosamente",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message || "Error al crear la cuenta",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    loginForm.reset();
    registerForm.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === "login" ? "Iniciar Sesión" : "Registrarse"}
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            {mode === "login" 
              ? "Accede a tu dashboard personalizado" 
              : "Crea tu cuenta para comenzar"
            }
          </p>
        </DialogHeader>

        {mode === "login" ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...loginForm.register("email")}
                data-testid="input-email"
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                {...loginForm.register("password")}
                data-testid="input-password"
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <Checkbox className="mr-2" />
                <span className="text-muted-foreground">Recordarme</span>
              </label>
              <button type="button" className="text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full font-medium"
              data-testid="button-submit-login"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-2">Usuarios de prueba:</p>
              <div className="space-y-1 text-xs">
                <p><strong>Admin:</strong> admin@softwarepar.lat / admin123</p>
                <p><strong>Cliente:</strong> cliente@test.com / cliente123</p>
                <p><strong>Partner:</strong> partner@test.com / partner123</p>
              </div>
            </div>

            <div className="text-center">
              <span className="text-muted-foreground">¿No tienes cuenta? </span>
              <button
                type="button"
                onClick={() => onModeChange("register")}
                className="text-primary hover:underline"
                data-testid="link-register"
              >
                Regístrate aquí
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                placeholder="Tu nombre completo"
                {...registerForm.register("fullName")}
                data-testid="input-fullname"
              />
              {registerForm.formState.errors.fullName && (
                <p className="text-sm text-destructive mt-1">
                  {registerForm.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="registerEmail">Email</Label>
              <Input
                id="registerEmail"
                type="email"
                placeholder="tu@email.com"
                {...registerForm.register("email")}
                data-testid="input-register-email"
              />
              {registerForm.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="registerPassword">Contraseña</Label>
              <Input
                id="registerPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...registerForm.register("password")}
                data-testid="input-register-password"
              />
              {registerForm.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Tipo de cuenta</Label>
              <Select
                onValueChange={(value) => registerForm.setValue("role", value as "client" | "partner")}
                defaultValue="client"
              >
                <SelectTrigger data-testid="select-role">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                </SelectContent>
              </Select>
              {registerForm.formState.errors.role && (
                <p className="text-sm text-destructive mt-1">
                  {registerForm.formState.errors.role.message}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="terms" className="mt-1" />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                Acepto los <button type="button" className="text-primary hover:underline">términos y condiciones</button>
                {" "}y la <button type="button" className="text-primary hover:underline">política de privacidad</button>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
              data-testid="button-submit-register"
            >
              {registerMutation.isPending ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>

            <div className="text-center">
              <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
              <button
                type="button"
                onClick={() => onModeChange("login")}
                className="text-primary hover:underline"
                data-testid="link-login"
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}