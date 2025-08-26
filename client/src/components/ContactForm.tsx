import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { contactSchema, type ContactInput } from "@shared/schema";
import { Send } from "lucide-react";

export default function ContactForm() {
  const { toast } = useToast();

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      serviceType: "",
      budget: "",
      message: "",
      acceptTerms: false,
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactInput) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mensaje enviado",
        description: "Te contactaremos pronto. Gracias por tu interés.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar",
        description: error.message || "Hubo un problema al enviar tu mensaje",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactInput) => {
    contactMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName">Nombre completo *</Label>
          <Input
            id="fullName"
            placeholder="Tu nombre completo"
            {...form.register("fullName")}
            data-testid="input-fullname"
          />
          {form.formState.errors.fullName && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            {...form.register("email")}
            data-testid="input-email"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="company">Empresa</Label>
          <Input
            id="company"
            placeholder="Tu empresa"
            {...form.register("company")}
            data-testid="input-company"
          />
        </div>
        
        <div>
          <Label htmlFor="serviceType">Modalidad de interés</Label>
          <Select onValueChange={(value) => form.setValue("serviceType", value)}>
            <SelectTrigger data-testid="select-service-type">
              <SelectValue placeholder="Selecciona una modalidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compra">Compra Completa</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="consulta">Solo Consulta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="budget">Presupuesto estimado (USD)</Label>
        <Select onValueChange={(value) => form.setValue("budget", value)}>
          <SelectTrigger data-testid="select-budget">
            <SelectValue placeholder="Selecciona un rango" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
            <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
            <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
            <SelectItem value="25000+">$25,000+</SelectItem>
            <SelectItem value="indefinido">No estoy seguro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="message">Describe tu proyecto *</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Cuéntanos sobre tu proyecto: objetivos, funcionalidades principales, tecnologías preferidas, etc."
          {...form.register("message")}
          data-testid="textarea-message"
        />
        {form.formState.errors.message && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.message.message}
          </p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="acceptTerms"
          onCheckedChange={(checked) => form.setValue("acceptTerms", !!checked)}
          data-testid="checkbox-terms"
        />
        <label htmlFor="acceptTerms" className="text-sm text-muted-foreground">
          Acepto recibir comunicaciones comerciales de SoftwarePar y confirmo que he leído la{" "}
          <button type="button" className="text-primary hover:underline">
            política de privacidad
          </button>
        </label>
      </div>
      {form.formState.errors.acceptTerms && (
        <p className="text-sm text-destructive">
          {form.formState.errors.acceptTerms.message}
        </p>
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={contactMutation.isPending}
        data-testid="button-submit-contact"
      >
        <Send className="h-4 w-4 mr-2" />
        {contactMutation.isPending ? "Enviando..." : "Enviar Mensaje"}
      </Button>
    </form>
  );
}
