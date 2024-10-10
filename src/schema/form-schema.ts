import { z } from "zod";

const passwordWhitelist = z.custom<string>(
  (value) => {
    if (typeof value === "string") {
      const trimmedValue = value.trim();
      return /^[a-z0-9]+$/i.test(trimmedValue);
    }
    return false;
  },
  {
    message: "Password must only contain alphanumeric characters.",
  }
);

export const LoginFormSchema = z.object({
  email: z.string().email().trim(),
  password: passwordWhitelist,
});

export const RegisterFormSchema = z.object({
  firstname: z.string().min(5).max(50).trim(),
  lastname: z.string().min(5).max(50).trim(),
  email: z.string().email().trim(),
  password: passwordWhitelist,
  cpassword: passwordWhitelist,
  contactnumber: z.string().min(10).max(10).trim(),
});
