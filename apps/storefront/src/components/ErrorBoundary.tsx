import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Last line of defense against a render-time throw taking down the whole storefront -- shows a
 *  friendly fallback with a reload button instead of a blank white page. Query/fetch errors are
 *  already handled per-page via isError, so this only catches the unexpected: a bad render, a
 *  null-deref, etc. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Storefront crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
          <p className="text-lg font-semibold text-ink">Something went wrong.</p>
          <p className="max-w-sm text-sm text-ink/60">
            Sorry about that — please reload the page. If it keeps happening, try again in a minute.
          </p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
