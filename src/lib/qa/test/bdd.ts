/** Thin BDD labels for Vitest describe blocks (no Cucumber dependency). */
export function feature(name: string): string {
  return `Feature: ${name}`;
}

export function scenario(id: string, title: string): string {
  return `Scenario ${id}: ${title}`;
}
