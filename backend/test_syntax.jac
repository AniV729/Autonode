"""Minimal syntax test for jaclang 0.11.2"""

import time;

node TestNode {
    has name: str = "test";
    has value: int = 0;
}

with entry {
    t = TestNode(name="hello", value=42);
    root ++> t;
    print(t.name, t.value);
    print("time:", time.time());
    print("PASS");
}
