import { Label as LabelUI } from "@/components/ui/label"

type LabelParams = {
  value: string;
  isRequired?: boolean;
  htmlFor?: string;
}

export function Label ({
  value,
  isRequired,
  ...props
}: LabelParams) {
  return (
    <LabelUI
      {...props}
    >
      {value}
      {isRequired && <span className="text-red-500">*</span>}
    </LabelUI>
  )
}