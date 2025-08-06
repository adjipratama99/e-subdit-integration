import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export type Option = {
  value: string
  text: string
  exist?: boolean
  [key: string]: any
}

type ComboBoxProps<T = Option> = {
  options?: T[]
  placeholder?: string
  isModal?: boolean
  className?: string
  fullWidth?: boolean
  groupedOptions?: Record<string, T[]>
  disableDataNotExist?: boolean
  isMulti?: boolean
  value?: string | string[]
  onChange: (val: string | string[]) => void
  disabled?: boolean
  getOptionLabel?: (option: T) => string
  getOptionValue?: (option: T) => string
  classNames?: {
    option?: (props: { data: T; isSelected: boolean }) => string
    multiValueLabel?: () => string
  }
}

export function Select<T extends Option>({
  options = [],
  groupedOptions,
  placeholder = "Select",
  className,
  fullWidth,
  isMulti = false,
  value,
  onChange,
  disableDataNotExist = false,
  isModal = false,
  disabled = false,
  getOptionLabel = (o) => o.text,
  getOptionValue = (o) => o.value,
  classNames = {},
}: ComboBoxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [multiValue, setMultiValue] = React.useState<string[]>(Array.isArray(value) ? value : [])

  React.useEffect(() => {
    if (isMulti && Array.isArray(value)) {
      setMultiValue(value)
    }
  }, [value, isMulti])

  const handleChange = (val: string) => {
    if (isMulti) {
      let newValue: string[]
      if (multiValue.includes(val)) {
        newValue = multiValue.filter((v) => v !== val)
      } else {
        newValue = [...multiValue, val]
      }
      setMultiValue(newValue)
      onChange(newValue)
    } else {
      if (value === val) {
        onChange("") // unselect
      } else {
        onChange(val)
        setOpen(false)
      }
    }
  }

  const flatOptions: T[] = React.useMemo(() => {
    return options.length
      ? options
      : Object.values(groupedOptions ?? {}).flat()
  }, [options, groupedOptions])

  const displayText = React.useMemo(() => {
    if (isMulti) {
      if (multiValue.length === 0) return placeholder
      return multiValue
        .map((val) => {
          const opt = flatOptions.find((o) => getOptionValue(o) === val)
          return opt ? getOptionLabel(opt) : val
        })
        .join(", ")
    } else {
      const selected = flatOptions.find((o) => getOptionValue(o) === value)
      return selected ? getOptionLabel(selected) : placeholder
    }
  }, [multiValue, value, flatOptions, getOptionLabel, getOptionValue])

  const renderOptions = (optionsList: T[]) => {
    return optionsList.map((option) => {
      const val = getOptionValue(option)
      const label = getOptionLabel(option)
      const isSelected = isMulti
        ? multiValue.includes(val)
        : value === val

      return (
        <CommandItem
          key={val}
          disabled={disableDataNotExist ? !option?.exist : disabled}
          onSelect={() => handleChange(val)}
          className={cn(
            classNames?.option?.({ data: option, isSelected }) ??
              (option.exist ? "text-blue-500" : "")
          )}
        >
          <div className="flex items-center gap-2 w-full">
            {isMulti && (
              <input
                type="checkbox"
                readOnly
                checked={isSelected}
                className="pointer-events-none"
              />
            )}
            <span className={cn(
              "flex-1",
              isMulti && isSelected && classNames?.multiValueLabel?.()
            )}>
              {label}
            </span>
            {isSelected && !isMulti && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </div>
        </CommandItem>
      )
    })
  }

  return (
    <Popover open={open} onOpenChange={!disabled ? setOpen : () => {}} modal={isModal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "justify-between max-w-auto",
            fullWidth && "w-full",
            className
          )}
        >
          <span
            className={cn(
              (isMulti ? multiValue.length === 0 : !value) && "text-muted-foreground",
              disabled && "opacity-50",
              "truncate"
            )}
          >
            {displayText}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 max-h-[300px] overflow-auto">
        <Command>
          <CommandInput placeholder="Search..." disabled={disabled} />
          <CommandEmpty>No results found.</CommandEmpty>

          {options.length ? (
            <CommandGroup>{renderOptions(options)}</CommandGroup>
          ) : (
            groupedOptions &&
            Object.entries(groupedOptions).map(([groupName, group]) => (
              <CommandGroup key={groupName} heading={groupName}>
                {renderOptions(group)}
              </CommandGroup>
            ))
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
