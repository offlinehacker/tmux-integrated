/**
 * VS Code terminal tab titles from tmux `#{window_name}`.
 *
 * The tmux window name is authoritative. The index is used only as a fallback
 * while a new window has no available name.
 */

/** Interpret `#{automatic-rename}` / `list-windows` field (version-dependent values). */
export function tmuxAutomaticRenameIsOn(value: string | undefined): boolean {
    const v = (value ?? '').trim().toLowerCase();
    return v === '1' || v === 'on' || v === 'yes' || v === 'true';
}

/**
 * @param windowName current `#{window_name}`
 * @param windowIndex zero-based `#{window_index}`
 */
export function pickTerminalTabTitle(
    windowName: string | undefined,
    windowIndex: number | undefined,
): string {
    const raw = windowName?.trim();
    if (raw) {
        return raw;
    }
    return windowIndex !== undefined ? `tmux:${windowIndex}` : 'tmux';
}
