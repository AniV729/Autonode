cl {
  def:pub app() {
    has count: int = 0;
    return (
      <div>
        <h1>Jac UI Smoke</h1>
        <button onClick={lambda -> None { count += 1; }}>
          Count {count}
        </button>
      </div>
    );
  }
}
