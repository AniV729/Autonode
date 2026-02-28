# Simple walker demo (valid Jac syntax for this repo)

walker demo_print {
    can start with entry {
        report { "message": "Hello from walker demo_print" };
    }
}

walker:pub demo_public {
    can start with entry {
        report { "status": "public walker active" };
    }
}
