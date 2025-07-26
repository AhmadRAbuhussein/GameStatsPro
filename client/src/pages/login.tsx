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

const phoneSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number").regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format"),
});

const otpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6, "OTP code must be 6 digits"),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function Login() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [, setLocation] = useLocation();

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
  });

  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { phone: "", code: "" },
  });

  const requestOtpMutation = useMutation({
    mutationFn: async (data: PhoneForm) => {
      return apiRequest("/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data, variables) => {
      setPhone(variables.phone);
      setStep("otp");
      otpForm.setValue("phone", variables.phone);
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

  const handlePhoneSubmit = (data: PhoneForm) => {
    requestOtpMutation.mutate(data);
  };

  const handleOtpSubmit = (data: OtpForm) => {
    verifyOtpMutation.mutate(data);
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setPhone("");
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
            {step === "phone" 
              ? "Enter your phone number to get started" 
              : "Enter the verification code sent to your phone"
            }
          </p>
        </div>

        {/* Login Forms */}
        <div 
          className="rounded-xl border p-8"
          style={{ backgroundColor: 'var(--gaming-secondary)', borderColor: 'var(--gaming-accent)' }}
        >
          {step === "phone" ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-6">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300" data-testid="label-phone">
                        Phone Number
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
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                      </FormControl>
                      <p className="text-sm text-gray-400" data-testid="help-phone">
                        We'll send you a verification code via SMS
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
                  <p className="text-white font-semibold" data-testid="otp-phone">
                    {phone}
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
                        Check your phone for the 6-digit verification code
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
                    onClick={handleBackToPhone}
                    className="w-full"
                    style={{ 
                      borderColor: 'var(--gaming-accent)',
                      color: 'white',
                      backgroundColor: 'transparent'
                    }}
                    data-testid="button-back-phone"
                  >
                    Back to Phone
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