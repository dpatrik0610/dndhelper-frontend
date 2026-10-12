import { Anchor, Text } from "@mantine/core";
import type { SrdVersion } from "@utils/monster";

const SRD: Record<SrdVersion, string> = {
  "5.1": "https://dnd.wizards.com/resources/systems-reference-document",
  "5.2": "https://www.dndbeyond.com/srd",
};

/** The CC-BY-4.0 attribution Wizards of the Coast asks for wherever SRD material is shown. */
export function SrdCredit({ versions }: { versions: SrdVersion[] }) {
  const link = (href: string, label: string) => (
    <Anchor href={href} target="_blank" rel="noreferrer" inherit>
      {label}
    </Anchor>
  );
  return (
    <Text size="xs" c="dimmed">
      This work includes material from the{" "}
      {versions.map((v, i) => (
        <span key={v}>
          {i > 0 && " and "}
          {link(SRD[v], `System Reference Document ${v} ("SRD ${v}")`)}
        </span>
      ))}{" "}
      by Wizards of the Coast LLC. The SRD is licensed under the{" "}
      {link("https://creativecommons.org/licenses/by/4.0/legalcode", "Creative Commons Attribution 4.0 International License")}.
    </Text>
  );
}
