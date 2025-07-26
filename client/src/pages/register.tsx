import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gamepad2, User, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const registrationSchema = z.object({
  phone: z.string().optional(),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const [, setLocation] = useLocation();

  // Check if user is authenticated
  const { data: userInfo, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { phone: "" },
  });

  const completeRegistrationMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      return apiRequest("/api/auth/complete-registration", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setLocation("/");
    },
  });

  const handleSubmit = (data: RegistrationForm) => {
    completeRegistrationMutation.mutate(data);
  };

  const handleSkip = () => {
    setLocation("/");
  };

  // Redirect if not authenticated
  if (!isLoadingUser && !userInfo?.user) {
    setLocation("/login");
    return null;
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gaming-dark)' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gaming-dark)' }}>
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
          >
            <Gamepad2 className="text-white text-2xl" data-testid="logo-icon" />
          </div>
          <h1 className="text-3xl font-bold text-white" data-testid="register-title">
            Complete Your Profile
          </h1>
          <p className="text-gray-400 mt-2" data-testid="register-subtitle">
            Add optional information to enhance your gaming experience
          </p>
        </div>

        {/* Success Message */}
        <Alert style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--gaming-success)' }}>
          <CheckCircle className="h-4 w-4" style={{ color: 'var(--gaming-success)' }} />
          <AlertDescription className="text-gray-300" data-testid="success-message">
            <strong style={{ color: 'var(--gaming-success)' }}>Email Verified!</strong>
            <br />
            Your account has been successfully verified. Welcome to GameStats!
          </AlertDescription>
        </Alert>

        {/* Registration Form */}
        <div 
          className="rounded-xl border p-8"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="text-center mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: 'var(--gaming-accent)' }}
                >
                  <User className="text-white" data-testid="profile-icon" />
                </div>
                <p className="text-white font-semibold" data-testid="user-email">
                  {userInfo?.user?.email}
                </p>
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300" data-testid="label-phone">
                      Phone Number (Optional)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Enter your phone number"
                          className="pl-10"
                          style={{ 
                            backgroundColor: 'var(--gaming-dark)', 
                            borderColor: 'var(--gaming-accent)',
                            color: 'white'
                          }}
                          data-testid="input-phone"
                        />
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <p className="text-sm text-gray-400" data-testid="help-phone">
                      Optional: For account recovery and notifications
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={completeRegistrationMutation.isPending}
                  className="w-full font-semibold text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
                  data-testid="button-complete-registration"
                >
                  {completeRegistrationMutation.isPending ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Completing...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  className="w-full"
                  style={{ 
                    borderColor: 'var(--gaming-accent)',
                    color: 'white',
                    backgroundColor: 'transparent'
                  }}
                  data-testid="button-skip"
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </Form>

          {/* Error Message */}
          {completeRegistrationMutation.error && (
            <Alert className="mt-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--gaming-error)' }}>
              <AlertTriangle className="h-4 w-4" style={{ color: 'var(--gaming-error)' }} />
              <AlertDescription className="text-gray-300" data-testid="error-message">
                <strong style={{ color: 'var(--gaming-error)' }}>Registration Error</strong>
                <br />
                {(completeRegistrationMutation.error as any)?.message || "Failed to complete registration"}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}