export const camelCaseToRegularCase = (s = '') => {
    if (s) {
      return s.split('_').join(' ');
    }
    return '';
  };

export const statusColorMap = {
  'received': '#ccccff',
  'onhold': '#ffebcc',
  'completed': '#9fdf9f',
  'dispatched': '#9fdf9f',
  'cancelled': '#ffb399',
  'received': '#ccccff',
  'onhold': '#ffebcc',
  'completed': '#9fdf9f',
  'dispatched': '#9fdf9f',
  'cancelled': '#ffb399',
  'pending': 'darkorange',
  'approve': 'lightgreen',
  'pending_approval': 'orange',
  paid: 'darkgreen'
}