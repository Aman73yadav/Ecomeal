import { Component } from "react";
import { btn } from "../utils/styles.js";

export class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: "var(--text)" }}>
          <h2 style={{ color: "var(--crit)" }}>Something went wrong (caught).</h2>
          <p style={{ color: "var(--muted)" }}>{String(this.state.error)}</p>
          <button onClick={() => this.setState({ error: null })} style={btn("var(--accent)")}>
            Recover
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
