// In  App or a parent component
import GenericSelect, { DropdownOption } from '@/components/form/genericSelect'; // Adjust path
// Assuming you still have  LocaleContext and useLocale hook
import { useLocale } from "../context/LocaleContext";

// Define  language data
const LANGUAGES_OPTIONS: DropdownOption<string>[] = [
  { value: "en", label: "English", display: "🇬🇧" },
  { value: "my", label: "မြန်မာ", display: "🇲🇲" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale() as {
    locale: string; // Ensure locale is compatible with T (string here)
    setLocale: (locale: string) => void;
  };

  return (
    <GenericSelect
      options={LANGUAGES_OPTIONS}
      selectedValue={locale}
      onSelect={(newValue) => setLocale(newValue)}
      placeholder="Choose Language"
      // Custom rendering for the button
      renderButtonContent={(selectedOption) => (
        <div className="flex items-center">
          {selectedOption?.display && (
            <span className="mr-2 text-xl leading-none">{selectedOption.display}</span>
          )}
          <span>{selectedOption ? selectedOption.label : "Select Language"}</span>
        </div>
      )}
      // Custom rendering for each option in the list
      renderOptionContent={(option) => (
        <>
          {option.display && (
            <span className="text-lg leading-none pr-1">{option.display}</span>
          )}
          <span>{option.label}</span>
        </>
      )}
      dropdownStyle='md:min-w-[120px] md:max-w-[120px] w-full'
      dropdownOpenStyle='md:top-13 md:bottom-auto'
    />
  );
}