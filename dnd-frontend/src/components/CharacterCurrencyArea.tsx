import { Group } from "@mantine/core";
import { CustomFieldset } from "./CustomFieldset";
import { CharacterCurrencyBox } from "./CharacterCurrencyBox";

export function CharacterCurrencyArea() {
  
  return (
    <CustomFieldset
      label="Owned Currency"
      borderColor="1px solid rgba(255,255,255,0.2)"
      labelBg="transparent"
      style={{
        width: "100%"
      }}
    >
      <Group justify="space-between" align="center">
        <CharacterCurrencyBox />
      </Group>
    </CustomFieldset>
  );
}
