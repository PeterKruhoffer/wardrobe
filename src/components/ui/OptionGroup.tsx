import { Pressable, StyleSheet, Text, View } from "react-native";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { colors } from "@/theme/colors";

type OptionGroupOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type OptionGroupProps<TValue extends string> = {
  disabled?: boolean;
  label: string;
  meta?: string;
  onChange: (value: TValue) => void;
  options: OptionGroupOption<TValue>[];
  value: TValue | null;
};

export function OptionGroup<TValue extends string>({
  disabled = false,
  label,
  meta,
  onChange,
  options,
  value,
}: OptionGroupProps<TValue>) {
  return (
    <View style={styles.section}>
      <SectionHeader label={label} meta={meta} />
      <View style={styles.options}>
        {options.map((option) => (
          <OptionButton
            disabled={disabled}
            key={option.value}
            label={option.label}
            onPress={() => onChange(option.value)}
            selected={option.value === value}
          />
        ))}
      </View>
    </View>
  );
}

function OptionButton({
  disabled,
  label,
  onPress,
  selected,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && !disabled && styles.optionPressed,
        disabled && styles.optionDisabled,
      ]}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    alignItems: "center",
    backgroundColor: colors.surface.raised,
    borderColor: colors.border.subtle,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minHeight: 44,
    minWidth: "46%",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionPressed: {
    transform: [{ scale: 0.99 }],
  },
  optionSelected: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
  },
  optionText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: colors.brand.primary,
  },
});
