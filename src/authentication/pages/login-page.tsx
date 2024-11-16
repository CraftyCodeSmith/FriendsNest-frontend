//* package imports
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

//* component imports
import CardWrapper from "@/components/common/card-wrapper";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FaEye, FaEyeSlash } from "react-icons/fa";

//* file imports
import { LoginFormSchema } from "@/schema/form-schema";
import { useLoginMutation } from "../services/authApi"; // Add your login mutation hook

type LoginSchema = z.infer<typeof LoginFormSchema>;

/**
 * Functional component for the login page.
 * Manages the form state using useForm hook.
 * Toggles password visibility and handles form submission.
 */
const LoginPage = () => {
  //* =====> hooks
  const form = useForm<LoginSchema>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const navigator = useNavigate();

  //* =====> states
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation(); // Initialize the login mutation

  //* =====> handle functions
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onLoginSubmit = async (values: LoginSchema) => {
    const loginPayload = {
      email: values.email,
      password: values.password,
    };

    try {
      // Trigger the login mutation and await the response
      const response = await login(loginPayload).unwrap();
      if (response.token && typeof response.token === "string") {
        sessionStorage.setItem("authToken", response.token);
        navigator("/streaming");
      }
      // Navigate to streaming page or perform other actions on success
    } catch (error) {
      console.error("Login failed:", error);
      // Handle error (e.g., show error message)
    }
  };

  // const handleNavigateToStreaming = () => {
  //   navigator("/streaming");
  // };

  //* =====> use-effects
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form Errors:", errors); // Logs all validation errors
    }
  }, [errors]);

  return (
    <CardWrapper
      headerLabel="Welcome Back"
      backButtonLabel="Don't have an account? Register"
      backButtonHref="/register"
      backButtonVariant={"link"}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onLoginSubmit)}>
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="pb-3">
                <FormLabel className="text-lg font-bold"> Email </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="john.doe@gmail.com"
                    type="email"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-bold"> Password </FormLabel>
                <FormControl>
                  <div className="flex">
                    <Input
                      {...field}
                      placeholder="password@1243"
                      type={showPassword ? "text" : "password"}
                    />
                    {showPassword ? (
                      <FaEye
                        className="absolute bottom-[167px] right-10 text-xl text-white"
                        onClick={handleShowPassword}
                      />
                    ) : (
                      <FaEyeSlash
                        className="absolute bottom-[167px] right-10 text-xl text-white"
                        onClick={handleShowPassword}
                      />
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            <Button
              type="submit"
              className="mt-10 w-full p-5 text-lg bg-slate-900 text-slate-100"
            >
              {isLoading ? "Logging in..." : "Log-In"}
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginPage;
