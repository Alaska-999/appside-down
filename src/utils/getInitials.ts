export function getInitials(username?: string | null) {
    if (!username) return "?";
    return username.slice(0, 2).toUpperCase();
}