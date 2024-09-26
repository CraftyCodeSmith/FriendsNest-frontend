import React from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

const ReusableForm = ({
  children,
  title,
  description,
  buttonVariant,
  buttonText,
}: FormMetaData) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle> {title} </CardTitle>
        <CardDescription> {description} </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <Button variant={buttonVariant}>{buttonText}</Button>
      </CardFooter>
    </Card>
  );
};

export default ReusableForm;

type FormMetaData = {
  children: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonVariant:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  buttonHref: string;
};
