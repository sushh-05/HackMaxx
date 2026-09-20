import { SignUp } from "@clerk/nextjs";

export default function SignUpPage(): React.JSX.Element {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      fallbackRedirectUrl="/dashboard"
    />
  );
}
