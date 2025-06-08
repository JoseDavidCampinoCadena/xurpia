declare module 'react-select-country-list' {
  interface CountryOption {
    value: string;
    label: string;
  }

  function countryList(): {
    getData(): CountryOption[];
  };

  export = countryList;
}
