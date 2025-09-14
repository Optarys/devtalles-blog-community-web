export function formatDate(d: Date | string): string {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("es-NI", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}
