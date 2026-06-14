import { OptionGroup } from "@/components/ui/OptionGroup";
import {
  type WardrobeCategory,
  wardrobeCategoryOptions,
} from "@/features/wardrobe/types";

type CategoryPickerProps = {
  value: WardrobeCategory | null;
  onChange: (category: WardrobeCategory) => void;
  disabled?: boolean;
};

export function CategoryPicker({
  disabled = false,
  onChange,
  value,
}: CategoryPickerProps) {
  return (
    <OptionGroup
      disabled={disabled}
      label="Category"
      meta="Required"
      onChange={onChange}
      options={wardrobeCategoryOptions}
      value={value}
    />
  );
}
