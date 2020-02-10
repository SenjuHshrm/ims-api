exports.formatCurrency = (n) => {
  let parts = n.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  let res = parts.join('.')
  return '₱ ' + res
}
