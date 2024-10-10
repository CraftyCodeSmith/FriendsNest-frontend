import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import BackButton from "./back-button";

/**
 * Renders a card wrapper component for forms with header, body, and footer sections.
 *
 * @param {FormMetaData} children - The content of the card body.
 * @param {string} headerLabel - The label for the card header.
 * @param {string} headerDescription - The description for the card header.
 * @param {string} backButtonLabel - The label for the back button.
 * @param {string} backButtonVariant - The variant style for the back button.
 * @param {string} backButtonHref - The URL to navigate when the back button is clicked.
 * @returns {JSX.Element} A card wrapper component with header, body, and footer sections.
 */
const CardWrapper = ({
  children,
  headerLabel,
  headerDescription,
  backButtonLabel,
  backButtonVariant,
  backButtonHref,
}: FormMetaData) => {
  return (
    <Card className="w-[500px] font-roboto-r text-slate-900 shadow-slate-300 backdrop-blur-md bg-slate-300/70 border-none">
      {/* Header Section -> Form Card */}
      <CardHeader className="items-center text-2xl ">
        <CardTitle> {headerLabel} </CardTitle>
        <CardDescription> {headerDescription} </CardDescription>
      </CardHeader>
      {/* Body Section -> From Card */}
      <CardContent>{children}</CardContent>
      {/* Footer Section -> Form Card */}
      <CardFooter className="flex justify-center">
        <BackButton
          buttonHref={backButtonHref}
          buttonVariant={backButtonVariant}
          buttonLabel={backButtonLabel}
        />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;

type FormMetaData = {
  children: React.ReactNode;
  headerLabel: string;
  headerDescription?: string;
  backButtonLabel: string;
  backButtonVariant:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  backButtonHref: string;
};
