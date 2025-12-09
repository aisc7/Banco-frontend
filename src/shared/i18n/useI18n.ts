import { messages, MessageKey } from './messages';

const locale: keyof typeof messages = 'es';

export function useI18n() {
  const t = (key: MessageKey): string => {
    return messages[locale][key];
  };

  return { t, locale };
}

