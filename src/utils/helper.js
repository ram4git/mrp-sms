export const camelCaseToRegularCase = (s = '') => {
    if (s) {
      return s.split('_').join(' ');
    }
    return '';
  };