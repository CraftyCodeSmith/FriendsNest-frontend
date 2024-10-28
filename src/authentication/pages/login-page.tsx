//* package imports
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

//* component imports
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CardWrapper from "@/components/common/card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

//* file imports
import { LoginFormSchema } from "@/schema/form-schema";

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

  //* =====> handle functions
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onLoginSubmit = (values: LoginSchema) => {
    console.log("Form Values:", values);
  };

  const handleNavigateToStreaming = () => {
    navigator("/streaming");
  };

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
        <form onChange={handleSubmit(onLoginSubmit)}>
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
              onClick={handleNavigateToStreaming}
              className="mt-10 w-full p-5 text-lg bg-slate-900 text-slate-100"
            >
              Log-In
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginPage;
