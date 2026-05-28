export function getPostgresUrl() {
    const rawUrl = process.env.POSTGRES_URL;

    if (!rawUrl) {
        // Avoid build-time crashes when route modules are imported without runtime env.
        return "postgresql://invalid:invalid@localhost:5432/invalid";
    }

    // Keep explicit sslmode values untouched.
    if (rawUrl.includes("sslmode=")) {
        return rawUrl;
    }

    try {
        const parsed = new URL(rawUrl);
        const localHosts = new Set(["localhost", "127.0.0.1", "postgres", "db"]);

        if (localHosts.has(parsed.hostname)) {
            return rawUrl;
        }

        parsed.searchParams.set("sslmode", "require");
        return parsed.toString();
    } catch {
        return rawUrl;
    }
}
