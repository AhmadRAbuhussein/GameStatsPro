import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gamepad2, Mail, Shield, AlertTriangle } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "OTP code must be 6 digits"),
});

type EmailForm = z.infer<typeof emailSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function Login() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: "", code: "" },
  });

  const requestOtpMutation = useMutation({
    mutationFn: async (data: EmailForm) => {
      return apiRequest("/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data, variables) => {
      setEmail(variables.email);
      setStep("otp");
      otpForm.setValue("email", variables.email);
      // For demo purposes, show the OTP in console
      if (data.otp) {
        console.log("Demo OTP:", data.otp);
      }
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: OtpForm) => {
      return apiRequest("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      if (data.isNewUser) {
        setLocation("/register");
      } else {
        setLocation("/");
      }
    },
  });

  const handleEmailSubmit = (data: EmailForm) => {
    requestOtpMutation.mutate(data);
  };

  const handleOtpSubmit = (data: OtpForm) => {
    verifyOtpMutation.mutate(data);
  };

  const handleBackToEmail = () => {
    setStep("email");
    setEmail("");
    otpForm.reset();
  };

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
          <h1 className="text-3xl font-bold text-white" data-testid="login-title">
            Welcome to GameStats
          </h1>
          <p className="text-gray-400 mt-2" data-testid="login-subtitle">
            {step === "email" 
              ? "Enter your email to get started" 
              : "Enter the verification code sent to your email"
            }
          </p>
        </div>

        {/* Login Forms */}
        <div 
          className="rounded-xl border p-8"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          {step === "email" ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-6">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300" data-testid="label-email">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email address"
                            className="pl-10"
                            style={{ 
                              backgroundColor: 'var(--gaming-dark)', 
                              borderColor: 'var(--gaming-accent)',
                              color: 'white'
                            }}
                            data-testid="input-email"
                          />
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                      </FormControl>
                      <p className="text-sm text-gray-400" data-testid="help-email">
                        We'll send you a verification code
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full font-semibold text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
                  data-testid="button-send-otp"
                >
                  {requestOtpMutation.isPending ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Send Verification Code
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-gray-300" data-testid="otp-sent-message">
                    Verification code sent to:
                  </p>
                  <p className="text-white font-semibold" data-testid="otp-email">
                    {email}
                  </p>
                </div>

                <FormField
                  control={otpForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300" data-testid="label-otp">
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                          style={{ 
                            backgroundColor: 'var(--gaming-dark)', 
                            borderColor: 'var(--gaming-accent)',
                            color: 'white'
                          }}
                          data-testid="input-otp"
                        />
                      </FormControl>
                      <p className="text-sm text-gray-400" data-testid="help-otp">
                        Check your email for the 6-digit verification code
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={verifyOtpMutation.isPending}
                    className="w-full font-semibold text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, var(--gaming-pink), var(--gaming-blue))' }}
                    data-testid="button-verify-otp"
                  >
                    {verifyOtpMutation.isPending ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToEmail}
                    className="w-full"
                    style={{ 
                      borderColor: 'var(--gaming-accent)',
                      color: 'white',
                      backgroundColor: 'transparent'
                    }}
                    data-testid="button-back-email"
                  >
                    Back to Email
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Error Messages */}
          {(requestOtpMutation.error || verifyOtpMutation.error) && (
            <Alert className="mt-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--gaming-error)' }}>
              <AlertTriangle className="h-4 w-4" style={{ color: 'var(--gaming-error)' }} />
              <AlertDescription className="text-gray-300" data-testid="error-message">
                <strong style={{ color: 'var(--gaming-error)' }}>Authentication Error</strong>
                <br />
                {(requestOtpMutation.error as any)?.message || (verifyOtpMutation.error as any)?.message || "Something went wrong"}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}