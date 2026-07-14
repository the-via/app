import belgian from './keymap_belgian';
import bepo from './keymap_bepo';
import brazilian_abnt2 from './keymap_brazilian_abnt2';
import canadian_multilingual from './keymap_canadian_multilingual';
import colemak from './keymap_colemak';
import croatian from './keymap_croatian';
import czech from './keymap_czech';
import danish from './keymap_danish';
import dvorak from './keymap_dvorak';
import dvorak_fr from './keymap_dvorak_fr';
import dvorak_programmer from './keymap_dvorak_programmer';
import estonian from './keymap_estonian';
import finnish from './keymap_finnish';
import french from './keymap_french';
import french_afnor from './keymap_french_afnor';
import french_mac_iso from './keymap_french_mac_iso';
import german from './keymap_german';
import greek from './keymap_greek';
import hebrew from './keymap_hebrew';
import hungarian from './keymap_hungarian';
import icelandic from './keymap_icelandic';
import irish from './keymap_irish';
import italian from './keymap_italian';
import italian_mac_ansi from './keymap_italian_mac_ansi';
import italian_mac_iso from './keymap_italian_mac_iso';
import japanese from './keymap_japanese';
import korean from './keymap_korean';
import latvian from './keymap_latvian';
import lithuanian_azerty from './keymap_lithuanian_azerty';
import lithuanian_qwerty from './keymap_lithuanian_qwerty';
import neo2 from './keymap_neo2';
import norman from './keymap_norman';
import norwegian from './keymap_norwegian';
import polish from './keymap_polish';
import portuguese from './keymap_portuguese';
import portuguese_mac_iso from './keymap_portuguese_mac_iso';
import romanian from './keymap_romanian';
import russian from './keymap_russian';
import serbian from './keymap_serbian';
import serbian_latin from './keymap_serbian_latin';
import slovak from './keymap_slovak';
import slovenian from './keymap_slovenian';
import spanish from './keymap_spanish';
import spanish_dvorak from './keymap_spanish_dvorak';
import spanish_latin_america from './keymap_spanish_latin_america';
import swedish from './keymap_swedish';
import swedish_mac_ansi from './keymap_swedish_mac_ansi';
import swedish_mac_iso from './keymap_swedish_mac_iso';
import swedish_pro_mac_ansi from './keymap_swedish_pro_mac_ansi';
import swedish_pro_mac_iso from './keymap_swedish_pro_mac_iso';
import swiss_de from './keymap_swiss_de';
import swiss_fr from './keymap_swiss_fr';
import turkish_f from './keymap_turkish_f';
import turkish_q from './keymap_turkish_q';
import uk from './keymap_uk';
import ukrainian from './keymap_ukrainian';
import us from './keymap_us';
import us_extended from './keymap_us_extended';
import us_international from './keymap_us_international';
import us_international_linux from './keymap_us_international_linux';
import workman from './keymap_workman';
import workman_zxcvm from './keymap_workman_zxcvm';

export type KeycodeLUT = Record<string, {name: string; title?: string; alias?: string}>;

export interface KeymapExtra {
  label: string;
  prefix: string;
  sendstring: string;
  isANSI: boolean;
  locales: string[];
  keycodeLUT: KeycodeLUT;
}

export const keymapExtras: Record<string, KeymapExtra> = {
  keymap_us: {
    label: 'English (US)',
    prefix: 'KC',
    sendstring: '',
    isANSI: true,
    locales: ['en-US', 'en'],
    keycodeLUT: us,
  },
  keymap_belgian: {
    label: 'Belgian',
    prefix: 'BE',
    sendstring: 'belgian',
    isANSI: false,
    locales: ['nl-BE', 'fr-BE'],
    keycodeLUT: belgian,
  },
  keymap_bepo: {
    label: 'Bépo',
    prefix: 'BP',
    sendstring: 'bepo',
    isANSI: false,
    locales: ['fr', 'fr-FR'],
    keycodeLUT: bepo,
  },
  keymap_brazilian_abnt2: {
    label: 'Brazilian ABNT2',
    prefix: 'BR',
    sendstring: 'brazilian_abnt2',
    isANSI: false,
    locales: ['pt-BR'],
    keycodeLUT: brazilian_abnt2,
  },
  keymap_canadian_multilingual: {
    label: 'Canadian Multilingual',
    prefix: 'CA',
    sendstring: 'canadian_multilingual',
    isANSI: false,
    locales: ['fr-CA'],
    keycodeLUT: canadian_multilingual,
  },
  keymap_colemak: {
    label: 'Colemak',
    prefix: 'CM',
    sendstring: 'colemak',
    isANSI: true,
    locales: ['en-US'],
    keycodeLUT: colemak,
  },
  keymap_croatian: {
    label: 'Croatian',
    prefix: 'HR',
    sendstring: 'croatian',
    isANSI: false,
    locales: ['hr', 'hr-HR'],
    keycodeLUT: croatian,
  },
  keymap_czech: {
    label: 'Czech',
    prefix: 'CZ',
    sendstring: 'czech',
    isANSI: false,
    locales: ['cs', 'cs-CZ'],
    keycodeLUT: czech,
  },
  keymap_danish: {
    label: 'Danish',
    prefix: 'DK',
    sendstring: 'danish',
    isANSI: false,
    locales: ['da', 'da-DK'],
    keycodeLUT: danish,
  },
  keymap_dvorak: {
    label: 'Dvorak',
    prefix: 'DV',
    sendstring: 'dvorak',
    isANSI: true,
    locales: ['en-US'],
    keycodeLUT: dvorak,
  },
  keymap_dvorak_fr: {
    label: 'Dvorak (French)',
    prefix: 'DV',
    sendstring: 'dvorak_fr',
    isANSI: false,
    locales: ['fr', 'fr-FR'],
    keycodeLUT: dvorak_fr,
  },
  keymap_dvorak_programmer: {
    label: 'Dvorak Programmer',
    prefix: 'DP',
    sendstring: 'dvorak_programmer',
    isANSI: true,
    locales: ['en-US'],
    keycodeLUT: dvorak_programmer,
  },
  keymap_estonian: {
    label: 'Estonian',
    prefix: 'EE',
    sendstring: 'estonian',
    isANSI: false,
    locales: ['et', 'et-EE'],
    keycodeLUT: estonian,
  },
  keymap_finnish: {
    label: 'Finnish',
    prefix: 'FI',
    sendstring: 'finnish',
    isANSI: false,
    locales: ['fi', 'fi-FI'],
    keycodeLUT: finnish,
  },
  keymap_french: {
    label: 'French',
    prefix: 'FR',
    sendstring: 'french',
    isANSI: false,
    locales: ['fr', 'fr-FR'],
    keycodeLUT: french,
  },
  keymap_french_afnor: {
    label: 'French (AFNOR)',
    prefix: 'FR',
    sendstring: 'french_afnor',
    isANSI: false,
    locales: ['fr', 'fr-FR'],
    keycodeLUT: french_afnor,
  },
  keymap_french_mac_iso: {
    label: 'French (Mac ISO)',
    prefix: 'FR',
    sendstring: 'french_mac_iso',
    isANSI: false,
    locales: ['fr', 'fr-FR'],
    keycodeLUT: french_mac_iso,
  },
  keymap_german: {
    label: 'German',
    prefix: 'DE',
    sendstring: 'german',
    isANSI: false,
    locales: ['de', 'de-DE'],
    keycodeLUT: german,
  },
  keymap_greek: {
    label: 'Greek',
    prefix: 'GR',
    sendstring: '',
    isANSI: false,
    locales: ['el', 'el-GR'],
    keycodeLUT: greek,
  },
  keymap_hebrew: {
    label: 'Hebrew',
    prefix: 'IL',
    sendstring: '',
    isANSI: false,
    locales: ['he', 'he-IL'],
    keycodeLUT: hebrew,
  },
  keymap_hungarian: {
    label: 'Hungarian',
    prefix: 'HU',
    sendstring: 'hungarian',
    isANSI: false,
    locales: ['hu', 'hu-HU'],
    keycodeLUT: hungarian,
  },
  keymap_icelandic: {
    label: 'Icelandic',
    prefix: 'IS',
    sendstring: 'icelandic',
    isANSI: false,
    locales: ['is', 'is-IS'],
    keycodeLUT: icelandic,
  },
  keymap_irish: {
    label: 'Irish',
    prefix: 'IE',
    sendstring: 'uk',
    isANSI: true,
    locales: ['en-IE'],
    keycodeLUT: irish,
  },
  keymap_italian: {
    label: 'Italian',
    prefix: 'IT',
    sendstring: 'italian',
    isANSI: false,
    locales: ['it', 'it-IT'],
    keycodeLUT: italian,
  },
  keymap_italian_mac_ansi: {
    label: 'Italian (Mac ANSI)',
    prefix: 'IT',
    sendstring: 'italian_mac_ansi',
    isANSI: true,
    locales: ['it', 'it-IT'],
    keycodeLUT: italian_mac_ansi,
  },
  keymap_italian_mac_iso: {
    label: 'Italian (Mac ISO)',
    prefix: 'IT',
    sendstring: 'italian_mac_iso',
    isANSI: false,
    locales: ['it', 'it-IT'],
    keycodeLUT: italian_mac_iso,
  },
  keymap_japanese: {
    label: 'Japanese',
    prefix: 'JP',
    sendstring: 'japanese',
    isANSI: false,
    locales: ['ja', 'ja-JP'],
    keycodeLUT: japanese,
  },
  keymap_korean: {
    label: 'Korean',
    prefix: 'KR',
    sendstring: '',
    isANSI: true,
    locales: ['ko', 'ko-KR'],
    keycodeLUT: korean,
  },
  keymap_latvian: {
    label: 'Latvian',
    prefix: 'LV',
    sendstring: 'latvian',
    isANSI: false,
    locales: ['lv', 'lv-LV'],
    keycodeLUT: latvian,
  },
  keymap_lithuanian_azerty: {
    label: 'Lithuanian (AZERTY)',
    prefix: 'LT',
    sendstring: 'lithuanian_azerty',
    isANSI: false,
    locales: ['lt', 'lt-LT'],
    keycodeLUT: lithuanian_azerty,
  },
  keymap_lithuanian_qwerty: {
    label: 'Lithuanian (QWERTY)',
    prefix: 'LT',
    sendstring: 'lithuanian_qwerty',
    isANSI: true,
    locales: ['lt', 'lt-LT'],
    keycodeLUT: lithuanian_qwerty,
  },
  keymap_neo2: {
    label: 'Neo 2',
    prefix: 'NE',
    sendstring: '',
    isANSI: false,
    locales: ['de', 'de-DE'],
    keycodeLUT: neo2,
  },
  keymap_norman: {
    label: 'Norman',
    prefix: 'NO',
    sendstring: 'norman',
    isANSI: true,
    locales: ['en-US'],
    keycodeLUT: norman,
  },
  keymap_norwegian: {
    label: 'Norwegian',
    prefix: 'NO',
    sendstring: 'norwegian',
    isANSI: false,
    locales: ['nb-NO', 'nn-NO'],
    keycodeLUT: norwegian,
  },
  keymap_polish: {
    label: 'Polish',
    prefix: 'PL',
    sendstring: '',
    isANSI: true,
    locales: ['pl', 'pl-PL'],
    keycodeLUT: polish,
  },
  keymap_portuguese: {
    label: 'Portuguese',
    prefix: 'PT',
    sendstring: 'portuguese',
    isANSI: false,
    locales: ['pt', 'pt-PT'],
    keycodeLUT: portuguese,
  },
  keymap_portuguese_mac_iso: {
    label: 'Portuguese (Mac ISO)',
    prefix: 'PT',
    sendstring: 'portuguese_mac_iso',
    isANSI: false,
    locales: ['pt', 'pt-PT'],
    keycodeLUT: portuguese_mac_iso,
  },
  keymap_romanian: {
    label: 'Romanian',
    prefix: 'RO',
    sendstring: 'romanian',
    isANSI: false,
    locales: ['ro', 'ro-RO'],
    keycodeLUT: romanian,
  },
  keymap_russian: {
    label: 'Russian',
    prefix: 'RU',
    sendstring: '',
    isANSI: true,
    locales: ['ru', 'ru-RU'],
    keycodeLUT: russian,
  },
  keymap_serbian: {
    label: 'Serbian (Cyrillic)',
    prefix: 'RS',
    sendstring: '',
    isANSI: false,
    locales: ['sr-Cyrl'],
    keycodeLUT: serbian,
  },
  keymap_serbian_latin: {
    label: 'Serbian (Latin)',
    prefix: 'RS',
    sendstring: 'serbian_latin',
    isANSI: false,
    locales: ['sr'],
    keycodeLUT: serbian_latin,
  },
  keymap_slovak: {
    label: 'Slovak',
    prefix: 'SK',
    sendstring: 'slovak',
    isANSI: false,
    locales: ['sk', 'sk-SK'],
    keycodeLUT: slovak,
  },
  keymap_slovenian: {
    label: 'Slovenian',
    prefix: 'SI',
    sendstring: 'slovenian',
    isANSI: false,
    locales: ['sl', 'sl-SI'],
    keycodeLUT: slovenian,
  },
  keymap_spanish: {
    label: 'Spanish',
    prefix: 'ES',
    sendstring: 'spanish',
    isANSI: false,
    locales: ['es', 'es-ES'],
    keycodeLUT: spanish,
  },
  keymap_spanish_dvorak: {
    label: 'Spanish (Dvorak)',
    prefix: 'DV',
    sendstring: 'spanish_dvorak',
    isANSI: false,
    locales: ['es'],
    keycodeLUT: spanish_dvorak,
  },
  keymap_spanish_latin_america: {
    label: 'Spanish (Latin America)',
    prefix: 'ES',
    sendstring: 'spanish_latin_america',
    isANSI: false,
    locales: ['es-MX', 'es-AR'],
    keycodeLUT: spanish_latin_america,
  },
  keymap_swedish: {
    label: 'Swedish',
    prefix: 'SE',
    sendstring: 'swedish',
    isANSI: false,
    locales: ['sv', 'sv-SE'],
    keycodeLUT: swedish,
  },
  keymap_swedish_mac_ansi: {
    label: 'Swedish (Mac ANSI)',
    prefix: 'SE',
    sendstring: 'swedish',
    isANSI: true,
    locales: ['sv', 'sv-SE'],
    keycodeLUT: swedish_mac_ansi,
  },
  keymap_swedish_mac_iso: {
    label: 'Swedish (Mac ISO)',
    prefix: 'SE',
    sendstring: 'swedish',
    isANSI: false,
    locales: ['sv', 'sv-SE'],
    keycodeLUT: swedish_mac_iso,
  },
  keymap_swedish_pro_mac_ansi: {
    label: 'Swedish Pro (Mac ANSI)',
    prefix: 'SE',
    sendstring: 'swedish',
    isANSI: true,
    locales: ['sv', 'sv-SE'],
    keycodeLUT: swedish_pro_mac_ansi,
  },
  keymap_swedish_pro_mac_iso: {
    label: 'Swedish Pro (Mac ISO)',
    prefix: 'SE',
    sendstring: 'swedish',
    isANSI: false,
    locales: ['sv', 'sv-SE'],
    keycodeLUT: swedish_pro_mac_iso,
  },
  keymap_swiss_de: {
    label: 'Swiss German',
    prefix: 'CH',
    sendstring: 'swiss_de',
    isANSI: false,
    locales: ['de-CH'],
    keycodeLUT: swiss_de,
  },
  keymap_swiss_fr: {
    label: 'Swiss French',
    prefix: 'CH',
    sendstring: 'swiss_fr',
    isANSI: false,
    locales: ['fr-CH'],
    keycodeLUT: swiss_fr,
  },
  keymap_turkish_f: {
    label: 'Turkish (F)',
    prefix: 'TR',
    sendstring: 'turkish_f',
    isANSI: false,
    locales: ['tr', 'tr-TR'],
    keycodeLUT: turkish_f,
  },
  keymap_turkish_q: {
    label: 'Turkish (Q)',
    prefix: 'TR',
    sendstring: 'turkish_q',
    isANSI: false,
    locales: ['tr', 'tr-TR'],
    keycodeLUT: turkish_q,
  },
  keymap_uk: {
    label: 'UK',
    prefix: 'UK',
    sendstring: 'uk',
    isANSI: false,
    locales: ['en-GB'],
    keycodeLUT: uk,
  },
  keymap_ukrainian: {
    label: 'Ukrainian',
    prefix: 'UA',
    sendstring: '',
    isANSI: true,
    locales: ['uk', 'uk-UA'],
    keycodeLUT: ukrainian,
  },
  keymap_us_extended: {
    label: 'US Extended',
    prefix: 'US',
    sendstring: '',
    isANSI: true,
    locales: ['en-US'],
    keycodeLUT: us_extended,
  },
  keymap_us_international: {
    label: 'US International',
    prefix: 'US',
    sendstring: '',
    isANSI: true,
    locales: ['en-US'],
    keycodeLUT: us_international,
  },
  keymap_us_international_linux: {
    label: 'US International (Linux)',
    prefix: 'US',
    sendstring: '',
    isANSI: true,
    locales: ['en-US'],
    keycodeLUT: us_international_linux,
  },
  keymap_workman: {
    label: 'Workman',
    prefix: 'WK',
    sendstring: 'workman',
    isANSI: true,
    locales: ['en-US'],
    keycodeLUT: workman,
  },
  keymap_workman_zxcvm: {
    label: 'Workman ZXCVM',
    prefix: 'WK',
    sendstring: 'workman_zxcvm',
    isANSI: true,
    locales: ['en-US'],
    keycodeLUT: workman_zxcvm,
  },
};

export const DEFAULT_HOST_KEYBOARD_LAYOUT = 'keymap_us';
