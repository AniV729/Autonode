cl import from '../frontend/src/App.js' { default as LegacyApp }

cl {
  def:pub app() {
    return <LegacyApp />;
  }
}
