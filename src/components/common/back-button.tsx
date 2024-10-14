import { Link } from "react-router-dom";
import { Button } from "../ui/button";

const BackButton = ({
  buttonLabel,
  buttonHref,
  buttonVariant,
}: BackButtonMetaData) => {
  return (
    <Button variant={buttonVariant} className="font-bold">
      <Link to={buttonHref}> {buttonLabel} </Link>
    </Button>
  );
};

export default BackButton;

type BackButtonMetaData = {
  buttonLabel: string;
  buttonHref: string;
  buttonVariant:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
};
