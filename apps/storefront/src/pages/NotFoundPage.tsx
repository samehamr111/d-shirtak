import { Container } from "../components/ui/Container";
import { LinkButton } from "../components/ui/LinkButton";

export function NotFoundPage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-8xl text-brand-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold">This page got lost in the wash.</h1>
      <p className="mt-2 text-ink/60">The page you're looking for doesn't exist.</p>
      <LinkButton to="/" className="mt-8">
        Back to Home
      </LinkButton>
    </Container>
  );
}
