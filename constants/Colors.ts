/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    coolColor: '#60f8fb',
    coolBgColor: '#10292a',
    heatColor: '#f9ed4e',
    heatBgColor: '#29240a',
    autoColor: '#6efb7e',
    autoBgColor: '#142816',
    iconColor: '#93999c',
    buttonBgColor: '#1D1D1D',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    coolColor: '#60f8fb',
    coolBgColor: '#10292a',
    heatColor: '#f9ed4e',
    heatBgColor: '#29240a',
    autoColor: '#6efb7e',
    autoBgColor: '#142816',
    iconColor: '#93999c',
    buttonBgColor: '#1D1D1D',
  },
};

export const Rooms = ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Kids Room'];

const _gradientColors = [
  '#00BFFF',
  '#00FF7F',
  '#FFD700',
  '#ee5f26',
  '#00BFFF',
];
const _gradientColors1 = [
  '#A7C7E7',
  '#B5EAD7',
  '#FFF1BA',
  '#FFB7B2',
  '#A7C7E7',
];
const _gradientColors2 = [
  '#FFE066',
  '#FFD700',
  '#F4511E',
  '#FF7043',
  '#FF8A65',
];
const _gradientColors3 = [
  '#001F3F',
  '#0074D9',
  '#7FDBFF',
  '#B0E0E6',
  '#001F3F',
];
const _gradientColors4 = [
  '#800080',
  '#A259F7',
  '#B2FF59',
  '#76FF03',
  '#800080',
];

export const RoomPallets = [
  _gradientColors,
  _gradientColors1,
  _gradientColors2,
  _gradientColors3,
  _gradientColors4,
];