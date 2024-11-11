//* package imports
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
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
import { RegisterFormSchema } from "@/schema/form-schema";

// Import the `useRegisterMutation` hook from RTK Query
import { useRegisterMutation } from "../services/authApi";

type RegisterSchema = z.infer<typeof RegisterFormSchema>;

/**
 * Functional component for the Register Page.
 * Manages form state, handles form submission, and toggles password visibility.
 * Utilizes zod for form validation and react-hook-form for form handling.
 */
const RegisterPage = () => {
  //* =====> hooks
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      // cpassword: "",
      // contactnumber: "",
      // bio: "", // Add the bio field
      // documentId: "", // Add the documentId field (optional if needed)
      // status: true, // Default to true (can be changed based on form input if needed)
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  //* =====> states
  const [showPassword, setShowPassword] = useState(false);

  //* =====> handle functions
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Use the `useRegisterMutation` hook from RTK Query
  const [register, { isLoading, error }] = useRegisterMutation();

  const onRegisterSubmit = async (values: RegisterSchema) => {
    // Log the form values for debugging
    console.log("Form Values:", values);

    try {
      // Construct the payload with relevant data
      const payload = {
        username: values.firstname + values.lastname,
        email: values.email,
        password: values.password,
      };

      // Attempt to register the user with the payload
      await register(payload).unwrap(); // Use unwrap to throw an error on failure
      alert("Registration Successful!");
    } catch (err) {
      // Handle any registration errors
      console.error("Registration failed:", err);
    }
  };

  //* =====> use-effects
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form Errors:", errors); // Logs all validation errors
    }
  }, [errors]);

  return (
    <CardWrapper
      headerLabel="Register Yourself"
      backButtonLabel="Already have an account? Login"
      backButtonHref="/"
      backButtonVariant={"link"}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onRegisterSubmit)}>
          <div className="pb-5 flex justify-between w-full">
            <FormField
              control={control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold">
                    {" "}
                    First Name{" "}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John"
                      type="text"
                      className="w-[210px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold">
                    {" "}
                    Last Name{" "}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Doe"
                      type="text"
                      className="w-[210px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="pb-4">
                <FormLabel className="text-lg font-bold"> Email </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="john.doe@example.com"
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
              <FormItem className="pb-4">
                <FormLabel className="text-lg font-bold"> Password </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="password@123"
                    type="password"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="cpassword"
            render={({ field }) => (
              <FormItem className="pb-4">
                <FormLabel className="text-lg font-bold">
                  {" "}
                  Confirm Password{" "}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      placeholder="password@123"
                      type={showPassword ? "text" : "password"}
                    />
                    {showPassword ? (
                      <FaEye
                        className="absolute bottom-[260px] right-10 text-xl text-white"
                        onClick={handleShowPassword}
                      />
                    ) : (
                      <FaEyeSlash
                        className="absolute bottom-[260px] right-10 text-xl text-white"
                        onClick={handleShowPassword}
                      />
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="contactnumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-bold">
                  {" "}
                  Contact Number{" "}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="+91 1234567890"
                    type="tel"
                    maxLength={10}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Bio Field */}
          {/* <FormField
            control={control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-bold"> Bio </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Tell us about yourself"
                    type="text"
                  />
                </FormControl>
              </FormItem>
            )}
          /> */}

          <div className="flex justify-center">
            <Button
              type="submit"
              className="mt-10 w-full p-5 text-lg bg-slate-900 text-slate-100"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterPage;
