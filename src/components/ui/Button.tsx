import { Link, type Href } from "expo-router";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type PressableStateCallbackType,
} from "react-native";
import type { PropsWithChildren } from "react";

import { colors } from "@/theme/colors";

type ButtonVariant = "primary" | "soft" | "outline" | "overlay";
type ButtonSize = "small" | "medium" | "large" | "icon";

type ButtonBaseProps = Omit<PressableProps, "children"> & {
  icon?: SymbolViewProps["name"];
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type ButtonProps = PropsWithChildren<ButtonBaseProps>;

type LinkButtonProps = Omit<ButtonProps, "onPress"> & {
  href: Href;
};

export function Button({
  accessibilityRole = "button",
  children,
  disabled = false,
  icon,
  size = "medium",
  style,
  variant = "primary",
  ...pressableProps
}: ButtonProps) {
  const iconTint = getIconTint(variant);

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      disabled={disabled}
      style={(state) => [
        styles.base,
        styles[variant],
        styles[size],
        state.pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        resolvePressableStyle(style, state),
      ]}
      {...pressableProps}
    >
      {icon ? <SymbolView name={icon} size={18} tintColor={iconTint} /> : null}
      {typeof children === "string" ? (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function LinkButton({ href, ...buttonProps }: LinkButtonProps) {
  return (
    <Link href={href} asChild>
      <Button accessibilityRole="link" {...buttonProps} />
    </Link>
  );
}

function resolvePressableStyle(
  style: PressableProps["style"],
  state: PressableStateCallbackType,
) {
  return typeof style === "function" ? style(state) : style;
}

function getIconTint(variant: ButtonVariant) {
  if (variant === "primary" || variant === "overlay") {
    return "#FFFFFF";
  }

  if (variant === "soft") {
    return colors.brand.primary;
  }

  return colors.text.primary;
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
    borderWidth: 1,
  },
  soft: {
    backgroundColor: colors.brand.soft,
    borderColor: colors.brand.primary,
    borderWidth: 1,
  },
  outline: {
    backgroundColor: colors.surface.raised,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  overlay: {
    backgroundColor: "rgba(17, 24, 39, 0.78)",
  },
  small: {
    minHeight: 36,
    paddingHorizontal: 12,
  },
  medium: {
    minHeight: 44,
    paddingHorizontal: 14,
  },
  large: {
    minHeight: 54,
    paddingHorizontal: 18,
  },
  icon: {
    height: 30,
    paddingHorizontal: 0,
    width: 30,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  label: {
    fontWeight: "800",
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  softLabel: {
    color: colors.brand.primary,
    fontSize: 15,
  },
  outlineLabel: {
    color: colors.text.primary,
    fontSize: 14,
  },
  overlayLabel: {
    color: "#FFFFFF",
    fontSize: 14,
  },
});
